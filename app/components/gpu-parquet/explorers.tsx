'use client'

import { useState, type CSSProperties } from 'react'
import { Explorer, ExplorerCaption, ExplorerChoices, ExplorerExplanation, ExplorerMetric, ExplorerTimeline } from '../explorer'
import measurements from './measurements.json'
import './explorers.css'

const source = 'https://github.com/sanjayyepuri/cudf_scratch/blob/824b8578d81ac26e8f4b63d01a6fec94ffb9d86d/experiments/'
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
  const [selected, setSelected] = useState(2)
  const p = measurements.pages[selected]
  const explanations = [
    'Small Pages expose plenty of decoder blocks, but each Column Chunk has 1,024 Page headers to walk. Header processing dominates the measured kernel time.',
    'With 256 Pages per Column Chunk, header processing is shorter than at 16 KiB. The decoder still has 1,024 data Pages to work on.',
    'With 64 Pages per Column Chunk, header work is short and the decoder still launches 256 blocks. This layout has the lowest median read time in the sweep.',
    'With 16 Pages per Column Chunk, headers are cheaper again, while value decoding takes longer. End-to-end read time remains close to the 256 KiB layout.',
    'Only one Page remains per Column Chunk. The value decoder launches just four blocks, and decoding those large Pages dominates the measured kernel time.',
  ]
  return <Explorer className="gpu-parquet-explorer" label="Interactive page-size experiment" title="Page Size Results">
    <div className="explorer-note">Select a measured layout. The timings and trace below follow your selection.</div>
    <div className="read-chart" role="group" aria-label="Page target">
      <div className="read-chart-heading"><span>Page target</span><span>Unprofiled read · ms</span></div>
      {measurements.pages.map((row, i) => <button className="read-chart-row" type="button" key={row.label} aria-pressed={i === selected} onClick={() => setSelected(i)} aria-label={`${row.label}: median read ${fmt(row.read)} milliseconds`}>
        <span>{row.label}</span><span className="read-bar-space"><span className="read-bar" style={width(row.read / 32 * 100)} /><span className="read-range" style={{ left: `${row.low / 32 * 100}%`, width: `${(row.high - row.low) / 32 * 100}%` }} /></span><span className="read-value">{fmt(row.read)} <small>ms</small></span>
      </button>)}
      <div className="read-chart-axis"><span>0</span><span>16</span><span>32 ms</span></div>
    </div>
    <div className="page-comparison">
      <div>
        <div className="explorer-subheading">Kernel Runtime</div>
        <ExplorerMetric label="Page headers" value={p.header} max={10} displayValue={`${fmt(p.header, 3)} ms`} color="var(--plot-header)" />
        <ExplorerMetric label="Value decoding" value={p.decoder} max={10} displayValue={`${fmt(p.decoder, 3)} ms`} color="var(--plot-decoder)" />
        <div className="explorer-note">Both bars share a 0–10 ms scale. Separate profiled medians.</div>
      </div>
      <div className="page-units" aria-live="polite"><div><strong>{p.perChunk.toLocaleString('en-US')}</strong><span>Pages / Column Chunk</span></div><div><strong>{p.pages.toLocaleString('en-US')}</strong><span>data-decoder blocks</span></div></div>
    </div>
    <ExplorerExplanation>{explanations[selected]}</ExplorerExplanation>
    <div className="trace-heading"><span className="explorer-subheading">Kernel Launch Timeline</span><span className="explorer-note">{p.label} · first measured profiled iteration</span></div>
    <ExplorerTimeline
      label={`${p.label} recorded CUDA timeline, from 0 to 32 milliseconds. Separate kernel and memory-copy lanes.`}
      max={32}
      lanes={['kernel', 'memcpy'].map(kind => ({
        label: kind === 'kernel' ? 'Kernels' : 'Copies',
        color: kind === 'kernel' ? 'var(--plot-decoder)' : 'var(--plot-copy)',
        events: p.events.filter(e => e[0] === kind).map(e => ({ start: Number(e[1]), duration: Number(e[2]) })),
      }))}
      ticks={[0, 8, 16, 24, 32].map(value => ({ value, label: value === 32 ? '32 ms' : value }))}
    />
    <ExplorerCaption number={3}>The same 8,388,608 INT64 values, four Row Groups, warm cache. Read bars show unprofiled medians; whiskers show observed min–max. Traces are separate profiled reads, not SM utilization. Subpixel events are widened for visibility. All layouts launched 33 kernels. <span className="explorer-source-note">No interpolated benchmark results.</span></ExplorerCaption>
    <a className="explorer-source" href={source + 'results-pages-traced/report.md'} target="_blank" rel="noopener noreferrer">Measurements and trace methodology ↗</a>
  </Explorer>
}

export function MemoryExplorer() {
  const runs = measurements.runs.filter(r => r.outputHint === 0)
  const [selected, setSelected] = useState(2)
  const run = runs[selected]
  return <Explorer className="gpu-parquet-explorer" label="Interactive pass-memory experiment" title="Memory-Runtime Tradeoff">
    <div className="explorer-control-label">Pass-memory hint <span>output limit disabled</span></div>
    <ExplorerChoices<number> label="Pass-memory hint" options={runs.map((r, value) => ({ label: hint(r.passHint), value }))} value={selected} onChange={setSelected} />
    <div className="memory-comparison" role="group" aria-label="Measured memory and latency comparison">
      <div className="memory-head"><span>Pass hint</span><span>Peak live RMM<span>0–2,000 MiB</span></span><span>Baseline read<span>0–7,000 ms</span></span></div>
      {runs.map((r, i) => <div className={`memory-row ${selected === i ? 'is-current' : ''}`} key={r.passHint}><span>{hint(r.passHint)}</span><div><span className="memory-meter"><span style={width(r.memory / 2000 * 100)} /></span><span>{fmt(r.memory)} <small>MiB</small></span></div><div><span className="latency-meter"><span style={width(r.read / 7000 * 100)} /></span><span>{fmt(r.read)} <small>ms</small></span></div></div>)}
    </div>
    <div className="batch-counts" aria-live="polite"><div><strong>{run.passes}</strong><span>input passes</span></div><span aria-hidden="true">→</span><div><strong>{run.subpasses}</strong><span>subpasses</span></div><span aria-hidden="true">→</span><div><strong>{run.outputs}</strong><span>output tables</span></div></div>
    <ExplorerExplanation>{run.passHint === 0 ? <>With the hint disabled, the reader uses one input pass and one subpass. It is fastest here, but peak tracked allocations reach {fmt(run.memory)} MiB.</> : <>At a {hint(run.passHint)} hint, peak live allocations are <strong>{fmt(run.memory)} MiB</strong> and reads take <strong>{fmt(run.read / runs[0].read, 1)}×</strong> as long as the unlimited baseline.{run.passHint === 16 || run.passHint === 64 ? ' The 16 and 64 MiB settings both use eight input passes; their subpass counts differ sharply.' : ''}</>}</ExplorerExplanation>
    <ExplorerCaption number={4} source={{ href: source + "results-subpasses/memory-report.md", label: "Data & method" }}>Measured configurations, on shared linear scales. Memory was measured separately from timing. Each returned table is consumed and released; the hint is not a cap on total memory.</ExplorerCaption>
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
