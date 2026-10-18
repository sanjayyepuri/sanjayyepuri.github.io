---
title: GPU Accelerating Parquet Reading 
publishedAt: 2026-10-17
author: Sanjay Yepuri
type: post
---
# GPU Accelerating Parquet Reading

At Chalk, I’ve been building a distributed query engine whose executor can target both CPUs and GPUs. For an early GPU demo, we compiled queries into cuDF operations and loaded their inputs from Parquet files. That raised two practical questions: how does cuDF read Parquet, and what controls does it provide for managing GPU memory?

Unfortunately, this got me thinking...

How does cuDF's parquet reader work? What controls does it provide for managing precious VRAM? I had a found a [paper](https://arxiv.org/html/2602.17335v1) discussing exactly my questions. I spent a morning diving deeper and getting my hands dirty.
### A Brief Tour of Parquet

Before we talk about cuDF, it's important to understand at a high level how data is laid out in a parquet file. This will enable us to reason about how the encoded/compressed data is loaded from disk and placed in memory. Then, how the reader decodes the data into units that can be combined to create a desired batch/chunk size. 

> Aside: confusingly different libraries use chunk, batch, group, etc. to mean different things. I will try to disambiguate this by treating parquet's terminology as proper nouns.

Parquet files have two sections. They have a metadata footer that is written after all the data. This section contains the information into order to index into first level of the data hierarchy called Row Groups and Column Chunks. It also could contain statistics and other information to select and prune Row Groups. 

The section preceding the footer in the file contains all the data. The logical table represented by a parquet file is divided by rows into a Row Group. This is a horizontal partitioning of the data. Within a Row Group there are Column Chunks for each column in the data. Within a Column Chunk are Pages. These contain the bytes that should be decoded. Once a Column Chunk is loaded into memory, we can start decoding it Page by Page.

I highly suggest reading [Parquet File Format](https://parquet.apache.org/docs/file-format/) for a more detailed look. I am glossing over a lot of useful details.
### cuDF's Parquet Reader

cuDF's parquet reader has a lot of details. Many details which I am going to be skipping. For our discussion, we are going to look with broad strokes how the reader controls how it manages the buffers for both the compressed and decompressed data. We are not going to discuss how it deals with nulls, nested and list datastructures and focus on tables with fixed-width data types.

> Nevertheless, these are important details to understand and would have real performance impacts. This is something we will likely explore in a later post.


That said, the core algorithm for decoding parquet is fairly straightforward. The chunked reader groups selected row groups into input passes and loads their encoded column chunks. It then uses page metadata to plan subpasses for decompression and decoding. `pass_read_limit` influences this batching, but is a soft hint rather than a cap on total GPU memory. A separate control, `chunk_read_limit`, governs the size of returned output tables.

The GPU parallelism occurs in two main spots: 
* Header kernels walk page headers within each column chunk, collecting information used to plan processing and allocate buffers. In this experiment, they assign one warp per column chunk.
- Value-decoding kernels materialize the selected pages into output buffers. In the measured fixed-width decoding path, the launch assigns one block per data page. 
### Experiments

Now that we know how the parquet reader works at a high level, we can see that the number of Pages and the Page size plays a large part in determining performance. We will run two experiments. The first looks to explore the results in Luo's paper regarding Page size. The second experiment will hold the Page size fixed and see how cuDF's parquet reader configuration leads to different number of passes and sub-passes.

> The experiments were run on an NVIDIA RTX 3090 with 24 GiB of VRAM, using a C++ reader built against libcudf 26.10 on Ubuntu 20.04 under WSL2. 
#### Sweep on Page Sizes

The first experiment is inspired by the paper; we will generate a parquet file with the same amount of table data.  The parquet will be laid out with 4 Row Group with a single Column Chunk. Each Column Chunk will have a different number of Pages based on the selected Page size. 

| Page target | Actual total pages | Median read | Observed min–max |
| ----------- | -----------------: | ----------: | ---------------: |
| 16 KiB      |              4,096 |   24.681 ms | 23.988–27.926 ms |
| 64 KiB      |              1,024 |   18.541 ms | 17.627–20.346 ms |
| 256 KiB     |                256 |   17.231 ms | 15.995–19.096 ms |
| 1 MiB       |                 64 |   17.412 ms | 16.098–19.383 ms |
| 16 MiB      |                  4 |   26.378 ms | 25.264–27.823 ms |

We can see that out results empirically agree with Luo's insight that each Column Chunk should have around more pages (around a 100). In my experiments we saw that between 16 and 64 pages provided the best performance. The paper mentions there is no one value that is the _optimal_.

At this point, I was wondering where time was being spent in the reader. Why does having more pages seem to substantially increase the runtime? 

Below is the same experiment run with tracing:

| Page target | Data-decoder grid | Header kernels | Value decoder | Kernel busy time | Memcpy busy time |
| ----------- | ----------------: | -------------: | ------------: | ---------------: | ---------------: |
| 16 KiB      |      4,096 blocks |       7.119 ms |      0.189 ms |         7.513 ms |         5.807 ms |
| 64 KiB      |      1,024 blocks |       1.721 ms |      0.178 ms |         2.017 ms |         5.461 ms |
| 256 KiB     |        256 blocks |       0.419 ms |      0.202 ms |         0.716 ms |         5.504 ms |
| 1 MiB       |         64 blocks |       0.113 ms |      0.611 ms |         0.800 ms |         5.495 ms |
| 16 MiB      |          4 blocks |       0.012 ms |      9.775 ms |         9.862 ms |         5.519 ms |

My initial guess was that there was more overhead in the decode side since each page couldn't be scheduled in the same sub-pass. This was wrong however. We can see that when the Page size is small, more time is spent in the header kernels. This aligns with our understanding that the these kernels are parallelized by Column Chunk, but scan the Page headers serially; more headers means the runtime contribution grows with the number of pages.

In a similar manner, if the Page size is large, we lose parallelism opportunities on the decode side. That's why the 16MiB page takes longer. There are only 4 launched blocks decoding larger Pages of data.

In each run, the read launched 33 kernels; page size changed grid and kernel runtime, not number of launches.

This core takeway is the same as Luo's paper, the page sized used in parquet plays a large part in the performance of GPU decoding. 
#### Memory Control

In the first experiment, I noticed that my parquet file was being decoded in a single pass and sub-pass. I wanted to see how the number of passes and sub-passes impacted performance. I understand that the additionally overhead would increase the runtime, but I wanted to verify that buffer memory used for reading the parquet is controlled.

 This experiment used eight row groups and three integer columns, compressed with ZSTD and written with a 1 MiB page target. The file occupied 251.6 MiB on disk and contained 640 MiB of numeric output. I varied `pass_read_limit` with the output limit disabled, consuming and releasing each returned table individually.

| Pass hint | Input passes / subpasses | Peak live RMM allocations | Baseline median read |
| --------- | -----------------------: | ------------------------: | -------------------: |
| Unlimited |                    1 / 1 |              1,861.60 MiB |            153.10 ms |
| 16 MiB    |                  8 / 248 |                 44.05 MiB |          6,423.41 ms |
| 64 MiB    |                   8 / 32 |                 94.36 MiB |            998.97 ms |
| 256 MiB   |                   4 / 12 |                259.16 MiB |            462.27 ms |
| 512 MiB   |                    2 / 6 |                510.77 MiB |            295.13 ms |
_Memory figures are peak live RMM allocations measured in separate runs, not physical VRAM residency measurements._

The 16 MiB and 64 MiB hints both required eight input passes, but the smaller hint increased subpasses from 32 to 248. It reduced peak live allocations from 94.36 MiB to 44.05 MiB while making reads about 6.4× slower. The hint therefore exposes a substantial memory–latency tradeoff, even when the input-pass count stays unchanged.

### Closing Out

cuDF provides controls for trading reader memory against throughput, but those controls are not hard memory guarantees. In these experiments, page layout affected the balance between header processing and value decoding, while the pass-memory hint affected batching and peak live allocations.

There are still many more details to be explored and whole experimental parquet reader in the cuDF code based. I wonder what that's for?