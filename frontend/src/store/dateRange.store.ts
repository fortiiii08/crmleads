import { create } from 'zustand'

function toLocalISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function subtractDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toLocalISO(d)
}

interface DateRangeStore {
  from: string
  to: string
  setRange: (from: string, to: string) => void
}

export const useDateRangeStore = create<DateRangeStore>(() => ({
  from: subtractDays(30),
  to: toLocalISO(new Date()),
  setRange: (from, to) => useDateRangeStore.setState({ from, to }),
}))
