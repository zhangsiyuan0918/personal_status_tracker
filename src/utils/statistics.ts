import type { StateRecord } from '../types/record'
import { formatDate } from './date'

export function getRecentRecordCoverage(records: StateRecord[], days: number): {
  recorded: number
  total: number
} {
  const targetDates = new Set<string>()

  for (let index = 0; index < days; index += 1) {
    const current = new Date()
    current.setHours(0, 0, 0, 0)
    current.setDate(current.getDate() - index)
    targetDates.add(formatDate(current))
  }

  const recordedDates = new Set(
    records.filter((record) => targetDates.has(record.date)).map((record) => record.date),
  )

  return {
    recorded: recordedDates.size,
    total: days,
  }
}