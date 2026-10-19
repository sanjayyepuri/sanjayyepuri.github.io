# Parquet article explainers

`explorers.tsx` supplies the five client components registered with the MDX renderer.
They render a useful default state on the server, inherit the article fonts, and
use CSS variables for the site's light/dark themes. The controls select measured
configurations; they do not interpolate or simulate benchmark results.

## Data provenance

`measurements.json` was extracted from `sanjayyepuri/cudf_scratch` at commit
`824b8578d81ac26e8f4b63d01a6fec94ffb9d86d`:

- `experiments/results-pages/summary.csv`: baseline median, min–max and Pages per Column Chunk.
- `experiments/results-pages-traced/summary.csv`: Page counts and profiled header/decoder timings.
- `experiments/results-pages-traced/timeline.csv`: every kernel and memcpy interval from the first measured iteration of each layout (425 intervals total).
- `experiments/results-subpasses/memory-summary.csv`: peak live RMM allocations, converted from bytes to MiB by dividing by 1,048,576.
- `experiments/results-subpasses/summary.csv`: baseline read times and traced batching/output counts.

Page layouts are joined by `page_target_bytes`. Memory and output configurations
are joined by `(pass_limit_mib, chunk_limit_mib)`. All source numeric precision is
retained; only display labels are rounded.

The hierarchy and reader stages are conceptual illustrations. The hierarchy's
four Page marks are not benchmark counts. Trace rectangles have a minimum width
of 0.8/1000 of the plot width for visibility; their positions use original times.
The trace is not a measure of SM utilization, and it is separate from the median
kernel measurements. Pass hints remain soft targets, not GPU capacity guarantees.
