import type { StateRecord } from '../types/record'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  return `${year}-${month}-${day}`
}

export function getTodayDate(): string {
  return formatDate(new Date())
}

export function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

export function sortRecordsByDateDesc(records: StateRecord[]): StateRecord[] {
  return [...records].sort((a, b) => b.date.localeCompare(a.date))
}

export function getRecordsWithinDays(records: StateRecord[], days: number, baseDate = new Date()) {
  const end = new Date(baseDate)
  end.setHours(23, 59, 59, 999)

  const start = new Date(baseDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  return sortRecordsByDateDesc(
    records.filter((record) => {
      const recordDate = new Date(`${record.date}T00:00:00`)
      return recordDate >= start && recordDate <= end
    }),
  )
}

export function getRecent7DaysRecords(records: StateRecord[], baseDate = new Date()) {
  return getRecordsWithinDays(records, 7, baseDate)
}

export function getRecent30DaysRecords(records: StateRecord[], baseDate = new Date()) {
  return getRecordsWithinDays(records, 30, baseDate)
}