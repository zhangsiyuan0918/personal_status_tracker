import type { StateRecord } from '../types/record'
import { getRecentDateStrings } from './date'

export function getRecordMapByDate(records: StateRecord[]): Record<string, StateRecord> {
  return records.reduce<Record<string, StateRecord>>((accumulator, record) => {
    accumulator[record.date] = record
    return accumulator
  }, {})
}

export function getRecentRecordCoverage(records: StateRecord[], days: number): {
  recorded: number
  total: number
} {
  const targetDates = new Set(getRecentDateStrings(days))
  const recordedDates = new Set(
    records.filter((record) => targetDates.has(record.date)).map((record) => record.date),
  )

  return {
    recorded: recordedDates.size,
    total: days,
  }
}

export function getCoverageMessage(recorded: number): string {
  if (recorded < 3) {
    return '先不用追求连续，留下几个状态点就有价值。'
  }

  if (recorded < 5) {
    return '已经有一些状态点了，可以慢慢看出变化。'
  }

  return `最近数据已经可以看出一点趋势了。`
}