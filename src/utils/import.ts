import type { StateRecord } from '../types/record'

export interface ImportResult {
  records: StateRecord[]
  added: number
  overwritten: number
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const METRIC_KEYS = ['energy', 'spark', 'action', 'connection', 'expression', 'stability'] as const

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isValidMetricValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10
}

export function parseJsonFileText(text: string): unknown {
  return JSON.parse(text)
}

export function validateImportedRecords(data: unknown): StateRecord[] {
  if (!Array.isArray(data)) {
    throw new Error('导入失败：文件格式不正确。')
  }

  const now = new Date().toISOString()

  return data.map((item) => {
    if (!isObject(item)) {
      throw new Error('导入失败：数据格式不符合要求。')
    }

    const date = item.date

    if (typeof date !== 'string' || !DATE_PATTERN.test(date)) {
      throw new Error('导入失败：数据格式不符合要求。')
    }

    for (const metricKey of METRIC_KEYS) {
      if (!isValidMetricValue(item[metricKey])) {
        throw new Error('导入失败：数据格式不符合要求。')
      }
    }

    return {
      id: typeof item.id === 'string' && item.id ? item.id : date,
      date,
      energy: item.energy as number,
      spark: item.spark as number,
      action: item.action as number,
      connection: item.connection as number,
      expression: item.expression as number,
      stability: item.stability as number,
      positiveNote: typeof item.positiveNote === 'string' ? item.positiveNote : '',
      drainNote: typeof item.drainNote === 'string' ? item.drainNote : '',
      actionNote: typeof item.actionNote === 'string' ? item.actionNote : '',
      createdAt: typeof item.createdAt === 'string' && item.createdAt ? item.createdAt : now,
      updatedAt: typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : now,
    }
  })
}

export function mergeRecords(
  localRecords: StateRecord[],
  importedRecords: StateRecord[],
): ImportResult {
  const recordMap = new Map(localRecords.map((record) => [record.date, record]))
  let added = 0
  let overwritten = 0

  for (const record of importedRecords) {
    const exists = recordMap.has(record.date)

    recordMap.set(record.date, {
      ...record,
      id: record.id || record.date,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || new Date().toISOString(),
    })

    if (exists) {
      overwritten += 1
    } else {
      added += 1
    }
  }

  const records = Array.from(recordMap.values()).sort((a, b) => b.date.localeCompare(a.date))

  return {
    records,
    added,
    overwritten,
  }
}