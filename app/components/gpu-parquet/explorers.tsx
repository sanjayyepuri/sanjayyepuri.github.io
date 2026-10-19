'use client'

import { useState, type CSSProperties } from 'react'
import { Explorer, ExplorerCaption, ExplorerChoices, ExplorerExplanation, ExplorerMetric, ExplorerTimeline } from '../explorer'
import measurements from './measurements.json'
import './explorers.css'

const source = 'https://github.com/sanjayyepuri/cudf_scratch/blob/e401f781491dd2d18713f3df29c29b9073414c36/experiments/'
const fmt = (n: number, digits = 2) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const hint = (n: number) => n === 0 ? 'Unlimited' : `${n} MiB`
const width = (n: number): CSSProperties => ({ width: `${n}%` })

export function ParquetLayout() {
  const [level, setLevel] = useState(0)
  const [group, setGroup] = useState(0)
  const [column, setColumn] = useState(0)
  const labels = ['Row Groups', 'Column Chunks', 'Pages']
  return <Explorer className="gpu-parquet-explorer layout-explorer" label="Parquet Hierarchy" title="Parquet Data Structure">
    <ExplorerChoices<number> label="Level of the Parquet hierarchy" options={labels.map((label, value) => ({ label, value }))} value={level} onChange={setLevel} />
    <div className="parquet-file">
      {[0, 1].map(r => <div key={r} className={`parquet-group ${group === r ? 'is-current' : ''}`}>
        <button type="button" className="row-group-label" aria-pressed={group === r} onClick={() => setGroup(r)}>Row Group {r + 1}<span>{r === 0 ? 'first rows' : 'next rows'}</span></button>
        <div className={`parquet-columns level-${level}`}>
          {[0, 1, 2].map(c => <button type="button" key={c} className={`parquet-column ${group === r && column === c ? 'is-current' : ''}`} aria-label={`Row Group ${r + 1}, Column Chunk ${'ABC'[c]}`} aria-pressed={group === r && column === c} onClick={() => { setGroup(r); setColumn(c); if (level === 0) setLevel(1) }}>
            <span className="chunk-label">{level === 0 ? 'ABC'[c] : `Chunk ${'ABC'[c]}`}</span>
            <span className="parquet-pages" aria-hidden="true">{[0, 1, 2, 3].map(p => <span key={p}>{level === 2 ? p + 1 : ''}</span>)}</span>
          </button>)}
        </div>
      </div>)}
      <div className="parquet-footer"><span>Metadata footer</span><span>locations + statistics</span></div>
    </div>
    <ExplorerExplanation>
      {level === 0 && <>Row Group {group + 1} contains a horizontal slice of the table: the same rows across every column.</>}
      {level === 1 && <>Column Chunk {'ABC'[column]} holds one column’s values for Row Group {group + 1}. Select another chunk to follow its place in the file.</>}
      {level === 2 && <>Inside Column Chunk {'ABC'[column]}, Pages hold the encoded values. The reader walks their headers, then decodes their contents.</>}
    </ExplorerExplanation>
    <ExplorerCaption number={1}>Select a level, then a Row Group or Column Chunk.</ExplorerCaption>
  </Explorer>
}

export function PageSizeExplorer() {
  const [scale, setScale] = useState<'large' | 'original'>('original')
  const [selected, setSelected] = useState(2)
  const pages = scale === 'large' ? measurements.largePages : measurements.pages
  const p = pages[selected]
  const readMax = scale === 'large' ? Math.ceil(Math.max(...pages.map(r => r.high)) / 1000) * 1000 : 32
  const kernelMax = Math.max(...pages.flatMap(r => [r.header, r.decoder])) * 1.1
  const traceMax = p.traceEnd
  const ticks = Array.from({ length: 5 }, (_, i) => traceMax * i / 4)
  return <Explorer className="gpu-parquet-explorer" label="Interactive page-size experiment" title="Page Size Results">
    <ExplorerChoices<'large' | 'original'> label="Dataset scale" options={[{ value: 'original', label: '64 MiB · original' }, { value: 'large', label: '15 GiB · new run' }]} value={scale} onChange={v => { setScale(v); setSelected(2) }} />
    <div className="explorer-note">{scale === 'large' ? '60 Row Groups; chunked reads with a fixed 2 GiB pass hint. File-cache residency is not guaranteed.' : 'Four Row Groups; original whole-file reads with a warm filesystem cache.'} Timing and tracing are separate runs.</div>
    <div className="read-chart" role="group" aria-label="Page target">
      <div className="read-chart-heading"><span>Page target</span><span>Unprofiled read · ms</span></div>
      {pages.map((row, i) => <button className="read-chart-row" type="button" key={row.label} aria-pressed={i === selected} onClick={() => setSelected(i)} aria-label={`${row.label}: median read ${fmt(row.read)} milliseconds`}>
        <span>{row.label}</span><span className="read-bar-space"><span className="read-bar" style={width(row.read / readMax * 100)} /><span className="read-range" style={{ left: `${row.low / readMax * 100}%`, width: `${(row.high - row.low) / readMax * 100}%` }} /></span><span className="read-value">{fmt(row.read)} <small>ms</small></span>
      </button>)}
      <div className="read-chart-axis"><span>0</span><span>{fmt(readMax / 2, 0)}</span><span>{fmt(readMax, 0)} ms</span></div>
    </div>
    <div className="page-comparison">
      <div>
        <div className="explorer-subheading">Kernel Runtime</div>
        <ExplorerMetric label="Page headers" value={p.header} max={kernelMax} displayValue={`${fmt(p.header, 3)} ms`} color="var(--plot-header)" />
        <ExplorerMetric label="Value decoding" value={p.decoder} max={kernelMax} displayValue={`${fmt(p.decoder, 3)} ms`} color="var(--plot-decoder)" />
        <div className="explorer-note">Shared 0–{fmt(kernelMax, 0)} ms scale. {scale === 'large' ? 'Totals from one separate profiled read.' : 'Separate profiled medians.'}</div>
      </div>
      <div className="page-units" aria-live="polite"><div><strong>{p.perChunk.toLocaleString('en-US')}</strong><span>Pages / Column Chunk</span></div><div><strong>{p.grids}</strong><span>blocks per decoder launch</span></div></div>
    </div>
    <ExplorerExplanation>{p.label} produces {p.pages.toLocaleString('en-US')} data Pages across the file. The trace recorded {p.decoderLaunches} value-decoder launches and {p.kernelCount} reader kernels. More Pages change the work within each launch; the launch count also reflects batching. {p.read === Math.min(...pages.map(r => r.read)) ? 'This configuration had the lowest median read time in this sweep.' : ''}</ExplorerExplanation>
    <div className="trace-heading"><span className="explorer-subheading">Kernel Launch Timeline</span><span className="explorer-note">{p.label} · {scale === 'large' ? 'first output batch from the profiled read' : 'first measured profiled iteration'}</span></div>
    <ExplorerTimeline label={`${p.label} recorded CUDA timeline. Separate kernel and memory-copy lanes.`} max={traceMax}
      lanes={['kernel', 'memcpy'].map(kind => ({ label: kind === 'kernel' ? 'Kernels' : 'Copies', color: kind === 'kernel' ? 'var(--plot-decoder)' : 'var(--plot-copy)', events: p.events.filter(e => e[0] === kind).map(e => ({ start: Number(e[1]), duration: Number(e[2]) })) }))}
      ticks={ticks.map(value => ({ value, label: `${fmt(value, 0)} ms` }))} />
    <ExplorerCaption number={3}>Read bars show unprofiled medians; whiskers show observed min–max. Traces are separate profiled reads, not SM utilization. For 15 GiB, kernel totals cover the full read while the timeline shows only its first output batch. Subpixel events are widened for visibility. The larger experiment changes row-group layout and read API as well as scale; compare Page sizes within a dataset, not absolute latency across the two datasets.</ExplorerCaption>
    <a className="explorer-source" href={source + (scale === 'large' ? 'results-large-pages-15gib/report.md' : 'results-pages-traced/report.md')} target="_blank" rel="noopener noreferrer">Measurements and trace methodology ↗</a>
  </Explorer>
}

export function MemoryExplorer() {
  const [scale, setScale] = useState<'large' | 'original'>('original')
  const runs = (scale === 'large' ? measurements.largeRuns : measurements.runs).filter(r => r.outputHint === 0)
  const [selected, setSelected] = useState(2)
  const run = runs[selected]
  const memoryMax = Math.ceil(Math.max(...runs.map(r => r.memory)) / 100) * 100
  const timeMax = Math.ceil(Math.max(...runs.map(r => r.read)) / 1000) * 1000
  const fastest = runs.reduce((a, b) => a.read < b.read ? a : b)
  return <Explorer className="gpu-parquet-explorer" label="Interactive pass-memory experiment" title="Memory-Runtime Tradeoff">
    <ExplorerChoices<'large' | 'original'> label="Dataset scale" options={[{ value: 'original', label: '640 MiB · original' }, { value: 'large', label: '15 GiB · new run' }]} value={scale} onChange={v => { setScale(v); setSelected(2) }} />
    <div className="explorer-control-label">Pass-memory hint <span>output limit disabled</span></div>
    <ExplorerChoices<number> label="Pass-memory hint" options={runs.map((r, value) => ({ label: hint(r.passHint), value }))} value={selected} onChange={setSelected} />
    <div className="memory-comparison" role="group" aria-label="Measured memory and latency comparison">
      <div className="memory-head"><span>Pass hint</span><span>Peak live RMM<span>0–{fmt(memoryMax, 0)} MiB</span></span><span>Baseline read<span>0–{fmt(timeMax, 0)} ms</span></span></div>
      {runs.map((r, i) => <div className={`memory-row ${selected === i ? 'is-current' : ''}`} key={r.passHint}><span>{hint(r.passHint)}</span><div><span className="memory-meter"><span style={width(r.memory / memoryMax * 100)} /></span><span>{fmt(r.memory)} <small>MiB</small></span></div><div><span className="latency-meter"><span style={width(r.read / timeMax * 100)} /></span><span>{fmt(r.read)} <small>ms</small></span></div></div>)}
    </div>
    <div className="batch-counts" aria-live="polite"><div><strong>{run.passes.toLocaleString('en-US')}</strong><span>input passes</span></div><span aria-hidden="true">→</span><div><strong>{run.subpasses.toLocaleString('en-US')}</strong><span>subpasses</span></div><span aria-hidden="true">→</span><div><strong>{run.outputs.toLocaleString('en-US')}</strong><span>output tables</span></div></div>
    <ExplorerExplanation>At a {hint(run.passHint).toLowerCase()} hint, peak live allocations are <strong>{fmt(run.memory)} MiB</strong> and reads take <strong>{fmt(run.read / fastest.read, 1)}×</strong> as long as the fastest measured setting ({hint(fastest.passHint).toLowerCase()}). {scale === 'large' ? 'The main grid is 256 MiB–8 GiB. The unlimited configuration was omitted because the earlier peak-to-data ratio would exceed available GPU memory; that is an estimate, not a measured OOM.' : 'The original smaller dataset fits with unlimited hints.'}</ExplorerExplanation>
    <ExplorerCaption number={4} source={{ href: source + (scale === 'large' ? 'results-large-15gib/memory-report.md' : 'results-subpasses/memory-report.md'), label: 'Data & method' }}>Measured configurations, on shared linear scales within each dataset. Memory was measured separately from timing. Each returned table is consumed and released; the hint is not a cap on total memory.</ExplorerCaption>
  </Explorer>
}

export function OutputExplorer() {
  const runs = measurements.runs.filter(r => r.passHint === 64)
  const [selected, setSelected] = useState(0)
  const run = runs[selected]
  return <Explorer className="gpu-parquet-explorer" label="Explore output tables versus subpasses" title="Output Table Output">
    <div className="explorer-control-label">Output-table hint <span>pass hint fixed at 64 MiB</span></div>
    <ExplorerChoices<number> label="Output-table hint" options={runs.map((r, value) => ({ label: hint(r.outputHint), value }))} value={selected} onChange={setSelected} />
    <div className="output-units"><div><span>Subpasses</span><strong>32</strong><div className="unit-marks" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} />)}</div></div><div><span>Returned tables</span><strong>{run.outputs}</strong><div className="unit-marks output-marks" aria-hidden="true">{Array.from({ length: run.outputs }, (_, i) => <i key={i} />)}</div></div></div>
    <ExplorerExplanation>{run.outputHint === 8 ? 'The 8 MiB output hint produces four times as many returned tables, while the subpass count stays at 32.' : `The ${hint(run.outputHint).toLowerCase()} output hint returns 32 tables across 32 subpasses.`} Peak live allocations remain {fmt(run.memory)} MiB. Baseline read: {fmt(run.read)} ms.</ExplorerExplanation>
    <ExplorerCaption number={5} source={{ href: source + "results-subpasses/report.md", label: "Data & method" }}>Each mark represents one subpass or one returned table. These are observed counts for the fixed 64 MiB pass-hint experiment.</ExplorerCaption>
  </Explorer>
}
