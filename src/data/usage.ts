// Demo usage scenarios. Billing period Nov 18 to Dec 18; "today" in the story is Dec 4 (day 16 of 30).
export type ScenarioId = 'plenty' | 'close' | 'out'

export interface Scenario {
  id: ScenarioId
  label: string
  queries: { search: number; answer: number; research: number }
  daily: number[] // queries per day since Nov 18
  storageGB: number
  objects: number
  bytesOutGB: number
  dataInGB: number
  byKey: { name: string; kind: string; queries: number }[]
  byBucket: { name: string; storage: string; queries: number }[]
}

export const PERIOD = { start: 'Nov 18', end: 'Dec 18', day: 16, days: 30, resetsIn: 14 }

const days = (arr: number[]) => arr

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  plenty: {
    id: 'plenty',
    label: 'Plenty left',
    queries: { search: 21, answer: 9, research: 4 },
    daily: days([0, 1, 3, 2, 0, 0, 4, 3, 2, 5, 1, 0, 0, 6, 4, 3]),
    storageGB: 12.4,
    objects: 318,
    bytesOutGB: 0.8,
    dataInGB: 12.9,
    byKey: [
      { name: 'cli-laptop', kind: 'Personal key', queries: 22 },
      { name: 'Playground', kind: 'App', queries: 12 },
    ],
    byBucket: [
      { name: 'design-specs', storage: '8.1 GB', queries: 25 },
      { name: 'support-calls', storage: '4.3 GB', queries: 9 },
    ],
  },
  close: {
    id: 'close',
    label: 'Getting close',
    queries: { search: 52, answer: 23, research: 11 },
    daily: days([2, 3, 4, 2, 1, 0, 5, 6, 4, 7, 9, 3, 2, 11, 13, 14]),
    storageGB: 41.2,
    objects: 1204,
    bytesOutGB: 3.6,
    dataInGB: 43.0,
    byKey: [
      { name: 'staging-agent', kind: 'Personal key', queries: 54 },
      { name: 'cli-laptop', kind: 'Personal key', queries: 19 },
      { name: 'Playground', kind: 'App', queries: 13 },
    ],
    byBucket: [
      { name: 'support-calls', storage: '28.7 GB', queries: 51 },
      { name: 'design-specs', storage: '12.5 GB', queries: 35 },
    ],
  },
  out: {
    id: 'out',
    label: 'Out of queries',
    queries: { search: 61, answer: 26, research: 13 },
    daily: days([2, 3, 4, 2, 1, 0, 5, 6, 4, 7, 9, 3, 2, 11, 13, 28]),
    storageGB: 41.6,
    objects: 1219,
    bytesOutGB: 4.1,
    dataInGB: 43.4,
    byKey: [
      { name: 'staging-agent', kind: 'Personal key', queries: 66 },
      { name: 'cli-laptop', kind: 'Personal key', queries: 20 },
      { name: 'Playground', kind: 'App', queries: 14 },
    ],
    byBucket: [
      { name: 'support-calls', storage: '29.1 GB', queries: 60 },
      { name: 'design-specs', storage: '12.5 GB', queries: 40 },
    ],
  },
}

export function totalQueries(s: Scenario) {
  return s.queries.search + s.queries.answer + s.queries.research
}

// Simple pace forecast: average of the last 7 days
export function forecast(s: Scenario, limit: number) {
  const used = totalQueries(s)
  const last7 = s.daily.slice(-7)
  const perDay = last7.reduce((a, b) => a + b, 0) / last7.length
  const projected = Math.round(used + perDay * PERIOD.resetsIn)
  const left = limit - used
  const daysLeft = perDay > 0 ? Math.floor(left / perDay) : Infinity
  return { perDay, projected, daysLeft, onTrack: projected <= limit }
}

// Dec 4 + n days, as "Dec 7"
export function dateFromToday(n: number) {
  const d = new Date(2026, 11, 4 + n)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
