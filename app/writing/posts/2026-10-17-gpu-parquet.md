---
title: GPU Accelerating Parquet Reading 
publishedAt: 2026-10-17
author: Sanjay Yepuri
type: post
---

# GPU Accelerating Parquet Reading

Lately, I've been working on building a new query engine at Chalk. The core rewrite enabled us to GPU accelerate our queries using cuDF. This was really a quick demo from my perspective to demonstrate we can target our query plans to various executors. 

It got me thinking though, how does parquet reading work on GPU? Being able to load data directly onto GPU would be neat if all further processing could keep the working set in device memory. However, it wasn't clear to me control how much compressed and decompressed data was resident in VRAM.

CuDF has a parquet reader that spent a morning looking at. I was curious about the controls it gave to tune memory performance during parquet reading. 

Additionally I found a short paper that I used for a framework while exploring: [Do GPUs Really Need New Tabular File Format](https://arxiv.org/html/2602.17335v1).

### The Parquet Data Structure

To begin, it's important to understand how data is laid out in a parquet file.  I would recommend reading  [Parquet File Format](https://parquet.apache.org/docs/file-format/) for a more detailed look. Let me introduce the core ideas. 

Parquet files have two sections. The first section contains the data and a second section contains the metadata. The metadata is written at the end after the data is written. In order to read the data, the reader should read the metadata first. This contains the indices and offsets into the data section to access the underlying table.

A Parquet file partitions rows into Row Groups. Each Row Group contains a Column Chunk for each column, and each Column Chunk contains Pages. The footer records metadata and column-chunk locations, allowing a reader to locate the selected columns without scanning the entire file.
### cuDFs Parquet Reader

I am most interested in how the reader controls how much resident memory is used. There are a lot of details on how it handles structs, list and other complex data types. For this study, I was focused on fixed-width data types since I just wanted to understand the general principle.

The core algorithm is simple. cuDF's parquet reader looks at the metadata and first prunes any row groups based on the user query. Then it will determine how many passes are required to load the decompressed data into configured memory limit. Then, once the Row Groups are loaded into memory, the reader will plan a set of sub-passes. Each sub-pass will select a subset of the Pages from each of the Column Chunks. It will then decode the pages into the final output buffer. 

It is important to understand where the GPU parallelism comes in. There are two core sets of kernels: 
* One set of Header kernels are used to populate the pass information such as where each page starts and compressed and uncompressed size. This information is used to allocate the buffers to hold the materialized data. The number of thread blocks used is determined by the number of Column Chunks.
* Then a second set of Decoder kernels are used to materialize the data into the output buffers. Here the the number of threads blocks the kernel is launched with is determined by the number of Pages.

I ran the experiments on an NVIDIA RTX 3090 with 24 GiB of VRAM, using a C++ reader built against libcudf 26.10 on Ubuntu 20.04 under WSL2. Files were read from WSL’s Linux filesystem with a warm cache and compatibility I/O enabled; GPUDirect Storage was not used.

### Sweep on Page Sizes

Knowing how the parquet reading works, it becomes clear that controlling the page size and how the reader plans sub-passes has material impact to runtime and memory usage. We begin by taking the first insight described in the Luo's paper and dive a bit deeper.

The page-size sweep used 8,388,608 non-null INT64 values—64 MiB of decoded data—split across four row groups, with PLAIN encoding and no compression or dictionaries. Only the target page size changed. Each layout received one warm-up and 15 measured reads, with shuffled execution order. Read timings included metadata processing, allocation, file access, transfer, and decoding, ending with GPU synchronization. GPU aggregation was timed separately and checked against a CPU reference.

The runtime result shows that there is a sweet spot when a Column Chunk contain 256 Pages. This aligns with insight from Luo's paper that over a 100 pages led to better results. Smaller pages expose more parallel work to the value decoder, but increase the number of headers to parse. The fastest configurations balance these costs.

| Page target | Actual total pages | Median read | Observed min–max |
| ----------- | -----------------: | ----------: | ---------------: |
| 16 KiB      |              4,096 |   24.681 ms | 23.988–27.926 ms |
| 64 KiB      |              1,024 |   18.541 ms | 17.627–20.346 ms |
| 256 KiB     |                256 |   17.231 ms | 15.995–19.096 ms |
| 1 MiB       |                 64 |   17.412 ms | 16.098–19.383 ms |
| 16 MiB      |                  4 |   26.378 ms | 25.264–27.823 ms |

I re-ran the experiment with tracing to track kernel launches in more detail. Here we can see how as we vary Page size, the time spent in Header kernels and Value decoder kernels have some inverse correlation. With fewer Pages, more time is spent in Value decoding since less GPU parallelism is available. Similarly, as we increase the number of Pages the time spent in Header kernels increases. This is due to the fact that the header kernels are parallelized over columns chunks and scan the page metadata serially.

| Page target | Data-decoder grid | Header kernels | Value decoder | Kernel busy time | Memcpy busy time |
| ----------- | ----------------: | -------------: | ------------: | ---------------: | ---------------: |
| 16 KiB      |      4,096 blocks |       7.119 ms |      0.189 ms |         7.513 ms |         5.807 ms |
| 64 KiB      |      1,024 blocks |       1.721 ms |      0.178 ms |         2.017 ms |         5.461 ms |
| 256 KiB     |        256 blocks |       0.419 ms |      0.202 ms |         0.716 ms |         5.504 ms |
| 1 MiB       |         64 blocks |       0.113 ms |      0.611 ms |         0.800 ms |         5.495 ms |
| 16 MiB      |          4 blocks |       0.012 ms |      9.775 ms |         9.862 ms |         5.519 ms 

Below is another visualization where we can see the time spent in each kernel.

![[tracing.png]]


### Memory Controls

The second piece I wanted to understand is given a fixed parquet file, what controls does cuDF provide to control  memory on GPU. In this experiment we vary two arguments.

| Parameter          | Controls                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `pass_read_limit`  | Memory used for reading and decompressing input; a **hint**, which an oversized RG can exceed |
The memory experiment used a separate ZSTD-compressed dataset with eight row groups and three integer columns: 251.6 MiB on disk and 640 MiB of numeric output. Output tables were consumed and released individually. Peak live RMM allocations were measured in three separate rounds per configuration; profiling and memory measurements were kept separate from baseline timing runs.

It becomes clear below that the number of passes increases (the `pass_read_limit` is decreased) the runtime increases. Each pass has a fixed cost for kernel launches, buffer allocations, etc. However, the peak live RMM allocations shows that we can control our resident memory. 

| Pass hint | Input passes / subpasses | Peak live RMM allocations | Baseline median read |
| --------- | -----------------------: | ------------------------: | -------------------: |
| Unlimited |                    1 / 1 |              1,861.60 MiB |            153.10 ms |
| 16 MiB    |                  8 / 248 |                 44.05 MiB |          6,423.41 ms |
| 64 MiB    |                   8 / 32 |                 94.36 MiB |            998.97 ms |
| 256 MiB   |                   4 / 12 |                259.16 MiB |            462.27 ms |
| 512 MiB   |                    2 / 6 |                510.77 MiB |            295.13 ms |

### Thoughts

This post was just a cursory look at how to think about optimizing reading parquet onto GPUs. There is a lot more to look at such as controlling the output chunk size. How do we select an *optimal* page size, etc. Even Nvidia has another experimental hybrid parquet reader. Further, we could explore how GPU directory storage impacts performance. 

The name of the game as usual in HPC is keeping the working set resident and local. Understanding how the underlying software provides the tools to accomplish this will enable building systems that maximize efficiency and performance. 
