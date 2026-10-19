'use client'

import type { CSSProperties, ReactNode } from 'react'
import './explorer.css'

/** Override tokens on a single figure; defaults follow the site's .dark theme. */
export type ExplorerStyle = CSSProperties & { [token: `--plot-${string}`]: string | number }
type Content = { children: ReactNode }

export function Explorer({ label, title, children, className = '', style }: Content & {
  label: string; title?: ReactNode; className?: string; style?: ExplorerStyle
}) {
  return <figure className={`embedded-explorer ${className}`} aria-label={label} style={style}>
    {title && <div className="explorer-kicker">{title}</div>}
    {children}
  </figure>
}

export function ExplorerCaption({ number, children, source }: Content & {
  number?: number; source?: { href: string; label: string }
}) {
  return <figcaption>{number !== undefined && <><span className="explorer-number">Figure {number}.</span>{' '}</>}{children}
    {source && <> <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></>}
  </figcaption>
}

/** Controlled selection; values must be unique within a group. */
export function ExplorerChoices<T extends string | number>({ label, options, value, onChange }: {
  label: string; options: readonly { value: T; label: ReactNode }[]; value: T; onChange: (value: T) => void
}) {
  return <div className="explorer-choices" role="group" aria-label={label}>
    {options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>
}

export function ExplorerExplanation({ children }: Content) {
  return <div className="explorer-explanation" aria-live="polite">{children}</div>
}

/** Visuals clamp to the scale; the supplied display value remains exact. */
function fraction(value: number, max: number) {
  return Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
}

export function ExplorerMetric({ label, value, max, displayValue, color = 'var(--plot-accent)' }: {
  label: string; value: number; max: number; displayValue: ReactNode; color?: string
}) {
  return <div className="explorer-metric" style={{ '--metric-color': color } as CSSProperties}>
    <div><span className="explorer-metric-key">{label}</span><span>{displayValue}</span></div>
    <div className="explorer-metric-track" aria-hidden="true"><span style={{ width: `${fraction(value, max) * 100}%` }} /></div>
  </div>
}

export type ExplorerTimelineLane = {
  label: string; color?: string; events: readonly { start: number; duration: number }[]
}

/** Events use the same units as max. Out-of-range intervals are clipped. */
export function ExplorerTimeline({ label, lanes, max, ticks }: {
  label: string; lanes: readonly ExplorerTimelineLane[]; max: number;
  ticks: readonly { value: number; label: ReactNode }[]
}) {
  return <div className="explorer-timeline" role="img" aria-label={label}>
    {lanes.map((lane, index) => <div className="explorer-timeline-lane" key={index}><span>{lane.label}</span>
      <svg viewBox="0 0 1000 30" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="15" x2="1000" y2="15" className="explorer-timeline-rule" />
        {lane.events.map((event, i) => {
          if (!Number.isFinite(event.start) || !Number.isFinite(event.duration) || event.duration <= 0 || event.start >= max || event.start + event.duration <= 0 || !Number.isFinite(max) || max <= 0) return null
          const start = fraction(event.start, max) * 1000
          const end = fraction(event.start + event.duration, max) * 1000
          return <rect key={i} x={start} y="3" width={Math.min(1000 - start, Math.max(end - start, .8))} height="24" fill={lane.color ?? 'var(--plot-accent)'} />
        })}
      </svg>
    </div>)}
    <div className="explorer-timeline-axis" aria-hidden="true">{ticks.map((tick, i) => <span key={i} style={{ left: `${fraction(tick.value, max) * 100}%` }}>{tick.label}</span>)}</div>
  </div>
}
