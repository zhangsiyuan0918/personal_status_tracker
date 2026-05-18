export interface StateRecord {
  id: string
  date: string

  energy: number
  spark: number
  action: number
  connection: number
  expression: number
  stability: number

  positiveNote?: string
  drainNote?: string
  actionNote?: string

  mode?: 'full' | 'simple'
  templateKey?: string

  createdAt: string
  updatedAt: string
}

export interface StatusResult {
  key: 'recovery' | 'low_burn' | 'island' | 'internal_friction' | 'ignite' | 'stable'
  name: string
  priority: number
  message: string
}

export interface ExportRecordRow {
  date: string
  energy: number
  spark: number
  action: number
  connection: number
  expression: number
  stability: number
  positiveNote: string
  drainNote: string
  actionNote: string
  createdAt: string
  updatedAt: string
}