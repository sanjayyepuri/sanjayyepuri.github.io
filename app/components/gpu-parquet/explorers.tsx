'use client'

import { useState, type ReactNode, type CSSProperties } from 'react'
import measurements from './measurements.json'
import './explorers.css'

const source = 'https://github.com/sanjayyepuri/cudf_scratch/blob/824b8578d81ac26e8f4b63d01a6fec94ffb9d86d/experiments/'
const fmt = (n: number, digits = 2) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const hint = (n: number) => n === 0 ? 'Unlimited' : `${n} MiB`
const width = (n: number): CSSProperties => ({ width: `${n}%` })

function Caption({ number, children, report }: { number: number; children: ReactNode; report?: string }) {
  return <figcaption><span className="explorer-number">Figure {number}.</span> {children}{report && <> <a href={source + report} target="_blank" rel="noopener noreferrer">Data &amp; method ↗</a></>}</figcaption>
}

function Choices({ label, options, selected, onChange }: { label: string; options: string[]; selected: number; onChange: (i: number) => void }) {
  return <div className="explorer-choices" role="group" aria-label={label}>{options.map((option, i) => <button key={option} type="button" aria-pressed={selected === i} onClick={() => onChange(i)}>{option}</button>)}</div>
}

export function ParquetLayout() {
  const [level, setLevel] = useState(0)
  const [group, setGroup] = useState(0)
  const [column, setColumn] = useState(0)
  const labels = ['Row Groups', 'Column Chunks', 'Pages']
  return <figure className="embedded-explorer layout-explorer" aria-label="Explore the Parquet hierarchy">
    <div className="explorer-kicker">One table, three levels</div>
    <Choices label="Level of the Parquet hierarchy" options={labels} selected={level} onChange={setLevel} />
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
    <div className="explorer-explanation" aria-live="polite">
      {level === 0 && <>Row Group {group + 1} contains a horizontal slice of the table: the same rows across every column.</>}
      {level === 1 && <>Column Chunk {'ABC'[column]} holds one column’s values for Row Group {group + 1}. Select another chunk to follow its place in the file.</>}
      {level === 2 && <>Inside Column Chunk {'ABC'[column]}, Pages hold the encoded values. The reader walks their headers, then decodes their contents.</>}
    </div>
    <Caption number={1}>Select a level, then a Row Group or Column Chunk. This is a schematic; the four Page marks illustrate nesting, not the benchmark’s Page count.</Caption>
  </figure>
}

const stages = [
  { title: 'Load chunks', label: 'Input pass', text: 'Selected Row Groups are grouped into input passes. Their encoded Column Chunks are loaded for processing.', unit: 'Encoded Column Chunks', control: 'pass_read_limit influences input-pass planning.' },
  { title: 'Read headers', label: 'Page metadata', text: 'Header kernels walk the Page headers within each Column Chunk. In this measured path, one warp handles each Column Chunk, so more Pages mean more serial header work.', unit: 'One warp / Column Chunk', control: 'Page layout determines how much header work each warp performs.' },
  { title: 'Decode pages', label: 'Subpass', text: 'Page metadata is used to plan subpasses for decompression and decoding. In this fixed-width path, the value decoder launches one block per data Page.', unit: 'One block / data Page', control: 'pass_read_limit also influences subpass planning.' },
  { title: 'Return tables', label: 'Output', text: 'Decoded values are returned as tables. An output boundary is distinct from a subpass boundary: one subpass can produce several returned tables.', unit: 'Returned output tables', control: 'chunk_read_limit governs the size of returned tables.' },
]
export function ReaderPipeline() {
  const [selected, setSelected] = useState(1)
  const stage = stages[selected]
  return <figure className="embedded-explorer" aria-label="Explore the cuDF reader stages">
    <div className="explorer-kicker">Follow the bytes</div>
    <div className="reader-stages" role="group" aria-label="Reader stage">{stages.map((s, i) => <button type="button" key={s.title} onClick={() => setSelected(i)} aria-pressed={selected === i}><span className="stage-index">0{i + 1}</span><span>{s.title}</span><small>{s.label}</small></button>)}</div>
    <div className="reader-detail" aria-live="polite"><div className="reader-unit">{stage.unit}</div><p>{stage.text}</p><div className="explorer-note">{stage.control}</div></div>
    <Caption number={2}>Select a stage to see its unit of work. Reader hints influence batching; they do not cap total GPU memory.</Caption>
  </figure>
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
  return <figure className="embedded-explorer" aria-label="Interactive page-size experiment">
    <div className="explorer-kicker">Change the Page size. Follow the cost.</div>
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
        <div className="explorer-subheading">Where the kernel time goes</div>
        <div className="kernel-measure"><div><span className="header-key">Page headers</span><span>{fmt(p.header, 3)} ms</span></div><div className="kernel-track"><span className="header-fill" style={width(p.header / 10 * 100)} /></div></div>
        <div className="kernel-measure"><div><span className="decoder-key">Value decoding</span><span>{fmt(p.decoder, 3)} ms</span></div><div className="kernel-track"><span className="decoder-fill" style={width(p.decoder / 10 * 100)} /></div></div>
        <div className="explorer-note">Both bars share a 0–10 ms scale. Separate profiled medians.</div>
      </div>
      <div className="page-units" aria-live="polite"><div><strong>{p.perChunk.toLocaleString('en-US')}</strong><span>Pages / Column Chunk</span></div><div><strong>{p.pages.toLocaleString('en-US')}</strong><span>data-decoder blocks</span></div></div>
    </div>
    <div className="explorer-explanation" aria-live="polite">{explanations[selected]}</div>
    <div className="trace-heading"><span className="explorer-subheading">The recorded read</span><span className="explorer-note">{p.label} · first measured profiled iteration</span></div>
    <div className="trace-lanes" role="img" aria-label={`${p.label} recorded CUDA timeline, from 0 to 32 milliseconds. Separate kernel and memory-copy lanes.`}>
      {['kernel', 'memcpy'].map(kind => <div className="trace-lane" key={kind}><span>{kind === 'kernel' ? 'Kernels' : 'Copies'}</span><svg viewBox="0 0 1000 30" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="15" x2="1000" y2="15" className="trace-rule" />{p.events.filter(e => e[0] === kind).map((e, i) => <rect key={i} x={Number(e[1]) / 32 * 1000} y="3" width={Math.max(Number(e[2]) / 32 * 1000, .8)} height="24" className={kind === 'kernel' ? 'decoder-fill' : 'copy-fill'} />)}</svg></div>)}
      <div className="trace-axis"><span>0</span><span>8</span><span>16</span><span>24</span><span>32 ms</span></div>
    </div>
    <Caption number={3}>The same 8,388,608 INT64 values, four Row Groups, warm cache. Read bars show unprofiled medians; whiskers show observed min–max. Traces are separate profiled reads, not SM utilization. Subpixel events are widened for visibility. All layouts launched 33 kernels. <span className="explorer-source-note">No interpolated benchmark results.</span></Caption>
    <a className="explorer-source" href={source + 'results-pages-traced/report.md'} target="_blank" rel="noopener noreferrer">Measurements and trace methodology ↗</a>
  </figure>
}

export function MemoryExplorer() {
  const runs = measurements.runs.filter(r => r.outputHint === 0)
  const [selected, setSelected] = useState(2)
  const run = runs[selected]
  return <figure className="embedded-explorer" aria-label="Interactive pass-memory experiment">
    <div className="explorer-kicker">A smaller working set has a cost</div>
    <div className="explorer-control-label">Pass-memory hint <span>output limit disabled</span></div>
    <Choices label="Pass-memory hint" options={runs.map(r => hint(r.passHint))} selected={selected} onChange={setSelected} />
    <div className="memory-comparison" role="group" aria-label="Measured memory and latency comparison">
      <div className="memory-head"><span>Pass hint</span><span>Peak live RMM<span>0–2,000 MiB</span></span><span>Baseline read<span>0–7,000 ms</span></span></div>
      {runs.map((r, i) => <div className={`memory-row ${selected === i ? 'is-current' : ''}`} key={r.passHint}><span>{hint(r.passHint)}</span><div><span className="memory-meter"><span style={width(r.memory / 2000 * 100)} /></span><span>{fmt(r.memory)} <small>MiB</small></span></div><div><span className="latency-meter"><span style={width(r.read / 7000 * 100)} /></span><span>{fmt(r.read)} <small>ms</small></span></div></div>)}
    </div>
    <div className="batch-counts" aria-live="polite"><div><strong>{run.passes}</strong><span>input passes</span></div><span aria-hidden="true">→</span><div><strong>{run.subpasses}</strong><span>subpasses</span></div><span aria-hidden="true">→</span><div><strong>{run.outputs}</strong><span>output tables</span></div></div>
    <div className="explorer-explanation" aria-live="polite">{run.passHint === 0 ? <>With the hint disabled, the reader uses one input pass and one subpass. It is fastest here, but peak tracked allocations reach {fmt(run.memory)} MiB.</> : <>At a {hint(run.passHint)} hint, peak live allocations are <strong>{fmt(run.memory)} MiB</strong> and reads take <strong>{fmt(run.read / runs[0].read, 1)}×</strong> as long as the unlimited baseline.{run.passHint === 16 || run.passHint === 64 ? ' The 16 and 64 MiB settings both use eight input passes; their subpass counts differ sharply.' : ''}</>}</div>
    <Caption number={4} report="results-subpasses/memory-report.md">Measured configurations, on shared linear scales. Memory was measured separately from timing. Each returned table is consumed and released; the hint is not a cap on total memory.</Caption>
  </figure>
}

export function OutputExplorer() {
  const runs = measurements.runs.filter(r => r.passHint === 64)
  const [selected, setSelected] = useState(0)
  const run = runs[selected]
  return <figure className="embedded-explorer" aria-label="Explore output tables versus subpasses">
    <div className="explorer-kicker">An output boundary is a different boundary</div>
    <div className="explorer-control-label">Output-table hint <span>pass hint fixed at 64 MiB</span></div>
    <Choices label="Output-table hint" options={runs.map(r => hint(r.outputHint))} selected={selected} onChange={setSelected} />
    <div className="output-units"><div><span>Subpasses</span><strong>32</strong><div className="unit-marks" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} />)}</div></div><div><span>Returned tables</span><strong>{run.outputs}</strong><div className="unit-marks output-marks" aria-hidden="true">{Array.from({ length: run.outputs }, (_, i) => <i key={i} />)}</div></div></div>
    <div className="explorer-explanation" aria-live="polite">{run.outputHint === 8 ? 'The 8 MiB output hint produces four times as many returned tables, while the subpass count stays at 32.' : `The ${hint(run.outputHint).toLowerCase()} output hint returns 32 tables across 32 subpasses.`} Peak live allocations remain {fmt(run.memory)} MiB. Baseline read: {fmt(run.read)} ms.</div>
    <Caption number={5} report="results-subpasses/report.md">Each mark represents one subpass or one returned table. These are observed counts for the fixed 64 MiB pass-hint experiment.</Caption>
  </figure>
}
