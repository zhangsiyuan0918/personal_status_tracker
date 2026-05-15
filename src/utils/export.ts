import type { ExportRecordRow, StateRecord } from '../types/record'

function escapeCsvValue(value: string | number) {
  const stringValue = String(value)
  const escapedValue = stringValue.replace(/"/g, '""')
  return `"${escapedValue}"`
}

function toExportRow(record: StateRecord): ExportRecordRow {
  return {
    date: record.date,
    energy: record.energy,
    spark: record.spark,
    action: record.action,
    connection: record.connection,
    expression: record.expression,
    stability: record.stability,
    positiveNote: record.positiveNote ?? '',
    drainNote: record.drainNote ?? '',
    actionNote: record.actionNote ?? '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export function createJsonExport(records: StateRecord[]): string {
  return JSON.stringify(records, null, 2)
}

export function createCsvExport(records: StateRecord[]): string {
  const headers = [
    'date',
    'energy',
    'spark',
    'action',
    'connection',
    'expression',
    'stability',
    'positiveNote',
    'drainNote',
    'actionNote',
    'createdAt',
    'updatedAt',
  ]

  const rows = records.map((record) => Object.values(toExportRow(record)).map(escapeCsvValue).join(','))

  return [headers.join(','), ...rows].join('\n')
}

export function downloadTextFile(content: string, fileName: string, mimeType: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    link.click()

    window.URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Failed to export file.', error)
    return false
  }
}

export function exportRecordsAsJson(records: StateRecord[], fileName: string): boolean {
  return downloadTextFile(createJsonExport(records), fileName, 'application/json')
}

export function exportRecordsAsCsv(records: StateRecord[], fileName: string): boolean {
  return downloadTextFile(createCsvExport(records), fileName, 'text/csv')
}