# Parquet article explainers

`explorers.tsx` supplies the four client components registered with the MDX renderer.
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

The hierarchy is a conceptual illustration. The hierarchy's
four Page marks are not benchmark counts. Trace rectangles have a minimum width
of 0.8/1000 of the plot width for visibility; their positions use original times.
The trace is not a measure of SM utilization, and it is separate from the median
kernel measurements. Pass hints remain soft targets, not GPU capacity guarantees.

Shared figure frames, controls, captions, metric bars, and timeline rendering come from `../explorer`. See that library’s README for reuse and theming. This directory owns the Parquet data, explanations, and specialized layouts.

## 15 GiB refresh (October 19)

The default selections now use results from `cudf_scratch` commit
`e401f781491dd2d18713f3df29c29b9073414c36`. The original smaller datasets remain separately selectable.

- `experiments/results-large-pages-15gib/summary.csv`: three unprofiled rounds per Page layout.
- `experiments/results-large-pages-15gib/trace-summary.csv`: full-reader GPU totals from one separate profiled round.
- `experiments/results-large-pages-15gib/timeline-*.csv`: exact first-output-batch excerpts, explicitly labelled separately from full-read totals.
- `experiments/results-large-15gib/summary.csv`: timing medians and observed pass/subpass/output counts.
- `experiments/results-large-15gib/memory-summary.csv`: two separate memory rounds per configuration, with byte-to-MiB conversion.

`experiments/export_blog.py` joins the CSVs into `largePages` and `largeRuns` without
rounding. The primary memory grid is 256 MiB–8 GiB; the earlier tiny-hint timing
sweep is a diagnostic, with no claimed memory measurements. Bar and timeline
scales derive from the selected measured dataset. The 15 GiB Page experiment
changes the API, row-group layout, and cache conditions along with scale, so it
is not an isolated scaling comparison against the original whole-file read.
