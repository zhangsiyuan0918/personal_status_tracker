import type { StateRecord } from '../types/record'
import { sortRecordsByDateDesc } from './date'

export const STORAGE_KEY = 'personal_state_records'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isValidRecord(record: unknown): record is StateRecord {
  if (!record || typeof record !== 'object') {
    return false
  }

  const candidate = record as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.energy === 'number' &&
    typeof candidate.spark === 'number' &&
    typeof candidate.action === 'number' &&
    typeof candidate.connection === 'number' &&
    typeof candidate.expression === 'number' &&
    typeof candidate.stability === 'number' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

function readRecords(): StateRecord[] {
  if (!canUseStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return sortRecordsByDateDesc(parsed.filter(isValidRecord))
  } catch (error) {
    console.error('Failed to read state records from localStorage.', error)
    return []
  }
}

function writeRecords(records: StateRecord[]) {
  if (!canUseStorage()) {
    return false
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortRecordsByDateDesc(records)))
    return true
  } catch (error) {
    console.error('Failed to write state records to localStorage.', error)
    return false
  }
}

export function getAllRecords(): StateRecord[] {
  return readRecords()
}

export function getRecordByDate(date: string): StateRecord | null {
  const records = readRecords()
  return records.find((record) => record.date === date) ?? null
}

export function saveRecord(record: StateRecord): boolean {
  const records = readRecords()
  const existingIndex = records.findIndex((item) => item.id === record.id || item.date === record.date)

  if (existingIndex >= 0) {
    const existingRecord = records[existingIndex]
    const updatedRecord: StateRecord = {
      ...existingRecord,
      ...record,
      createdAt: existingRecord.createdAt,
      updatedAt: new Date().toISOString(),
    }

    const nextRecords = [...records]
    nextRecords[existingIndex] = updatedRecord
    return writeRecords(nextRecords)
  }

  const timestamp = new Date().toISOString()
  const newRecord: StateRecord = {
    ...record,
    id: record.id || record.date,
    createdAt: record.createdAt || timestamp,
    updatedAt: timestamp,
  }

  return writeRecords([...records, newRecord])
}

export function deleteRecord(id: string): boolean {
  const records = readRecords()
  const nextRecords = records.filter((record) => record.id !== id)

  if (nextRecords.length === records.length) {
    return true
  }

  return writeRecords(nextRecords)
}

export function clearRecords(): boolean {
  if (!canUseStorage()) {
    return false
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear state records from localStorage.', error)
    return false
  }
}