# Article explorer library

Import from `app/components/explorer` in a client component. Styles load with the import; no Parquet imports or data are required. Compose primitives freely and keep selection state, measurements, formatting, and domain explanations in the consumer.

```tsx
'use client'

import { useState } from 'react'
import { Explorer, ExplorerChoices, ExplorerMetric, ExplorerExplanation, ExplorerCaption } from 'app/components/explorer'

const samples = [
  { value: 'small', label: 'Small batch', latency: 12 },
  { value: 'large', label: 'Large batch', latency: 28 },
]

export function BatchExplorer() {
  const [selected, setSelected] = useState('small')
  const sample = samples.find(item => item.value === selected)!
  return <Explorer label="Batch latency comparison" title="Choose a batch size">
    <ExplorerChoices<string> label="Batch size" options={samples} value={selected} onChange={setSelected} />
    <ExplorerMetric label="Latency" value={sample.latency} max={40} displayValue={`${sample.latency} ms`} />
    <ExplorerExplanation>{sample.label} took {sample.latency} ms.</ExplorerExplanation>
    <ExplorerCaption number={1}>Example data for demonstrating the API.</ExplorerCaption>
  </Explorer>
}
```

## Components

- `Explorer`: named figure, optional title, children, custom className, and typed CSS style overrides.
- `ExplorerChoices<T>`: controlled button group with unique string or number values, visible labels, native keyboard interaction, and pressed states. Use an explicit generic for React state setters when inference needs help. Supply a value present in the options.
- `ExplorerExplanation`: polite live region for concise updates after interaction.
- `ExplorerCaption`: optional figure number and source object (`href`, `label`). Sources open in a new tab.
- `ExplorerMetric`: label, numeric value, positive scale maximum, formatted displayValue, and optional CSS color. Values clamp visually to the scale; zero and invalid values render no bar. Display text stays under the consumer's control.
- `ExplorerTimeline`: accessible label, positive max, lanes with label/color/events (`start`, `duration`), and ticks (`value`, `label`). Use the same unit for events, ticks, and max; provide ticks in ascending order including both endpoints. Intervals clip to the domain, invalid/nonpositive intervals are omitted, and very short visible intervals widen to 0.8/1000 of the plot width. Describe that widening and the meaning of the timeline in the caption. Supply an informative label and adjacent textual data for readers who cannot see the plot.

## Styling

All library CSS is scoped under `.embedded-explorer`. Light and `.dark` palettes, mobile controls, keyboard focus, and reduced-motion behavior are included. Existing site fonts are used with system fallbacks.

Override `--plot-ink`, `--plot-muted`, `--plot-rule`, `--plot-soft`, and `--plot-accent` via the figure's `style` prop, or use a custom class with appropriate specificity for light and dark modes. For example: `style={{ '--plot-accent': '#936025' }}`. Choose colors with adequate contrast in each theme. Metric and timeline colors may reference your own variables.

Reusable CSS classes inside a figure: `explorer-note`, `explorer-subheading`, `explorer-control-label` (a child span supplies secondary text), `explorer-source`, and `explorer-source-note`. Add domain layout CSS in the consuming component's directory. The library has no fixed chart units, benchmark sources, or figure numbering scheme.

To embed a future explorer in a post, export its client component and register it in `app/components/mdx.tsx`, then use its JSX tag in the MDX file. The four Parquet explorers demonstrate integration and specialized layouts.
