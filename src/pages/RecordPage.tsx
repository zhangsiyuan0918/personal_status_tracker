import { useEffect, useState } from 'react'
import type { StateRecord } from '../types/record'
import { getTodayDate } from '../utils/date'
import { getRecordByDate, saveRecord } from '../utils/storage'

interface RecordPageProps {
  editingDate?: string | null
  onSaved: (savedDate: string) => void
}

type MetricKey =
  | 'energy'
  | 'spark'
  | 'action'
  | 'connection'
  | 'expression'
  | 'stability'

interface RecordFormState {
  energy: number
  spark: number
  action: number
  connection: number
  expression: number
  stability: number
  positiveNote: string
  drainNote: string
  actionNote: string
}

const metrics: Array<{ key: MetricKey; label: string; color: string }> = [
  { key: 'energy', label: '能量值', color: '#34d399' },
  { key: 'spark', label: '火苗值', color: '#fbbf24' },
  { key: 'action', label: '行动力', color: '#38bdf8' },
  { key: 'connection', label: '连接值', color: '#a78bfa' },
  { key: 'expression', label: '表达值', color: '#f472b6' },
  { key: 'stability', label: '情绪稳定值', color: '#22d3ee' },
]

const defaultFormState: RecordFormState = {
  energy: 5,
  spark: 5,
  action: 5,
  connection: 5,
  expression: 5,
  stability: 5,
  positiveNote: '',
  drainNote: '',
  actionNote: '',
}

function toFormState(record: StateRecord | null): RecordFormState {
  if (!record) {
    return { ...defaultFormState }
  }

  return {
    energy: record.energy,
    spark: record.spark,
    action: record.action,
    connection: record.connection,
    expression: record.expression,
    stability: record.stability,
    positiveNote: record.positiveNote ?? '',
    drainNote: record.drainNote ?? '',
    actionNote: record.actionNote ?? '',
  }
}

export function RecordPage({ editingDate, onSaved }: RecordPageProps) {
  const today = getTodayDate()
  const targetDate = editingDate ?? today
  const isEditingHistory = targetDate !== today

  const [form, setForm] = useState<RecordFormState>({ ...defaultFormState })
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const targetRecord = getRecordByDate(targetDate)
    setForm(toFormState(targetRecord))
    setSaveMessage('')
  }, [targetDate])

  const handleMetricChange = (key: MetricKey, value: number) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleTextChange = (
    key: keyof Pick<RecordFormState, 'positiveNote' | 'drainNote' | 'actionNote'>,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSave = () => {
    const existingRecord = getRecordByDate(targetDate)

    const record: StateRecord = {
      id: existingRecord?.id ?? targetDate,
      date: targetDate,
      energy: form.energy,
      spark: form.spark,
      action: form.action,
      connection: form.connection,
      expression: form.expression,
      stability: form.stability,
      positiveNote: form.positiveNote.trim(),
      drainNote: form.drainNote.trim(),
      actionNote: form.actionNote.trim(),
      createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const success = saveRecord(record)

    if (!success) {
      setSaveMessage('保存失败，请检查浏览器存储设置后重试。')
      return
    }

    setSaveMessage(isEditingHistory ? '已更新该日记录' : '已保存今日状态')
    onSaved(targetDate)
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
        <p className="text-sm text-slate-400">{isEditingHistory ? '编辑日期' : '今天是'}：{targetDate}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {isEditingHistory ? '编辑历史记录' : '今日记录'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          每项默认值为 5。若该日期已有记录，会自动回填并在保存时覆盖原记录。
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <div className="space-y-5">
          {metrics.map((metric) => (
            <label key={metric.key} className="block space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-200">{metric.label}</span>
                <span className="font-medium text-white">{form[metric.key]}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={form[metric.key]}
                onChange={(event) => handleMetricChange(metric.key, Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800"
                style={{ accentColor: metric.color }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <label className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天让我有感觉的事</p>
          <textarea
            rows={3}
            value={form.positiveNote}
            onChange={(event) => handleTextChange('positiveNote', event.target.value)}
            placeholder="例如：今天有什么让你感到一点点亮起来？"
            className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
          />
        </label>

        <label className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天消耗我的事</p>
          <textarea
            rows={3}
            value={form.drainNote}
            onChange={(event) => handleTextChange('drainNote', event.target.value)}
            placeholder="例如：什么事情带走了你的注意力和电量？"
            className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
          />
        </label>

        <label className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天完成的一个行动</p>
          <textarea
            rows={3}
            value={form.actionNote}
            onChange={(event) => handleTextChange('actionNote', event.target.value)}
            placeholder="例如：今天真正推进了哪一个现实动作？"
            className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
          />
        </label>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-sky-950/40 transition hover:bg-sky-400"
        >
          {isEditingHistory ? '保存这一天的修改' : '保存今日记录'}
        </button>

        {saveMessage ? <p className="text-center text-sm text-slate-400">{saveMessage}</p> : null}
      </div>
    </section>
  )
}