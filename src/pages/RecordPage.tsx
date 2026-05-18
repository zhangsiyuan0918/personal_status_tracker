import { useEffect, useMemo, useState } from 'react'
import {
  QUICK_STATE_GROUPS,
  type QuickStateGroupKey,
  type QuickStateOption,
} from '../constants/quickStates'
import type { StateRecord } from '../types/record'
import {
  getDateDaysAgoString,
  getRelativeDateLabel,
  getTodayDate,
  getYesterdayString,
  isSelectableRecordDate,
} from '../utils/date'
import { getPrimaryStatus } from '../utils/statusRules'
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

type RecordMode = 'full' | 'simple'

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

const simpleMetricKeys: MetricKey[] = ['energy', 'spark', 'stability']

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

function getQuickStateSelection(
  record: StateRecord | null,
): Record<QuickStateGroupKey, string | null> {
  const result: Record<QuickStateGroupKey, string | null> = {
    energy: null,
    progress: null,
    connection: null,
    mind: null,
  }

  for (const key of record?.quickStateKeys ?? []) {
    const matchedGroup = QUICK_STATE_GROUPS.find((group) =>
      group.options.some((option) => option.key === key),
    )

    if (matchedGroup) {
      result[matchedGroup.key] = key
    }
  }

  return result
}

export function RecordPage({ editingDate, onSaved }: RecordPageProps) {
  const today = getTodayDate()
  const yesterday = getYesterdayString()
  const minDate = getDateDaysAgoString(30)

  const initialDate =
    editingDate && isSelectableRecordDate(editingDate) ? editingDate : today

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [recordMode, setRecordMode] = useState<RecordMode>('simple')
  const [quickSelections, setQuickSelections] = useState<Record<QuickStateGroupKey, string | null>>({
    energy: null,
    progress: null,
    connection: null,
    mind: null,
  })
  const [showDetailedScores, setShowDetailedScores] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [form, setForm] = useState<RecordFormState>({ ...defaultFormState })
  const [feedbackRecord, setFeedbackRecord] = useState<StateRecord | null>(null)
  const [dateMessage, setDateMessage] = useState('')

  const isToday = selectedDate === today
  const isYesterday = selectedDate === yesterday
  const targetRecord = useMemo(() => getRecordByDate(selectedDate), [selectedDate])

  const visibleMetrics = useMemo(
    () =>
      recordMode === 'full'
        ? metrics
        : metrics.filter((metric) => simpleMetricKeys.includes(metric.key)),
    [recordMode],
  )

  useEffect(() => {
    setSelectedDate(initialDate)
  }, [initialDate])

  useEffect(() => {
    if (!isSelectableRecordDate(selectedDate)) {
      setDateMessage('只能补记最近 30 天内的状态。')
      return
    }

    setForm(toFormState(targetRecord))
    setRecordMode(targetRecord?.mode ?? 'simple')
    setQuickSelections(getQuickStateSelection(targetRecord))
    setShowDetailedScores(false)
    setShowNotes(false)
    setFeedbackRecord(null)
    setDateMessage(
      targetRecord ? '正在编辑这一天的记录。' : '这一天还没有记录。可以凭印象补一个大概状态。',
    )
  }, [selectedDate, targetRecord])

  const handleSelectDate = (nextDate: string) => {
    if (!isSelectableRecordDate(nextDate)) {
      setDateMessage('只能补记最近 30 天内的状态。')
      return
    }

    setSelectedDate(nextDate)
  }

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

  const handleQuickStateSelect = (groupKey: QuickStateGroupKey, option: QuickStateOption) => {
    setQuickSelections((current) => ({
      ...current,
      [groupKey]: option.key,
    }))

    setForm((current) => ({
      ...current,
      ...option.values,
    }))
  }

  const handleSave = () => {
    if (!isSelectableRecordDate(selectedDate)) {
      setDateMessage('只能补记最近 30 天内的状态。')
      setFeedbackRecord(null)
      return
    }

    const existingRecord = getRecordByDate(selectedDate)
    const isSimpleMode = recordMode === 'simple'
    const quickStateKeys = Object.values(quickSelections).filter((value): value is string =>
      Boolean(value),
    )

    const record: StateRecord = {
      id: existingRecord?.id ?? selectedDate,
      date: selectedDate,
      energy: form.energy,
      spark: form.spark,
      action: isSimpleMode ? existingRecord?.action ?? form.action ?? 5 : form.action,
      connection: isSimpleMode ? existingRecord?.connection ?? form.connection ?? 5 : form.connection,
      expression: isSimpleMode ? existingRecord?.expression ?? form.expression ?? 5 : form.expression,
      stability: form.stability,
      positiveNote: form.positiveNote.trim(),
      drainNote: form.drainNote.trim(),
      actionNote: form.actionNote.trim(),
      mode: recordMode,
      quickStateKeys,
      templateKey: existingRecord?.templateKey,
      createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const success = saveRecord(record)

    if (!success) {
      setFeedbackRecord(null)
      return
    }

    setFeedbackRecord(record)
  }

  const primaryStatus = feedbackRecord ? getPrimaryStatus(feedbackRecord) : null

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
        <p className="text-sm text-slate-400">快速记录</p>
        <h2 className="mt-1 text-xl font-semibold text-white">选几个接近今天的状态就行。</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">不用准确，留下一个状态痕迹就够了。</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">日期选择</p>
        <div className="mt-3 flex gap-2">
          {[{ key: today, label: '今天' }, { key: yesterday, label: '昨天' }].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectDate(item.key)}
              className={`rounded-2xl px-4 py-2 text-sm transition ${
                selectedDate === item.key
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <input
            type="date"
            min={minDate}
            max={today}
            value={selectedDate}
            onChange={(event) => handleSelectDate(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
          />
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          当前记录日期：{getRelativeDateLabel(selectedDate)}
        </p>
        {!isToday ? (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            补记不用太精确，留下大概状态就够了。
          </p>
        ) : null}
        {dateMessage ? <p className="mt-2 text-sm leading-6 text-slate-400">{dateMessage}</p> : null}
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-medium text-white">快速记录状态片段</p>
        {QUICK_STATE_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{group.label}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {group.options.map((option) => {
                const isSelected = quickSelections[group.key] === option.key

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleQuickStateSelect(group.key, option)}
                    className={`min-h-14 rounded-2xl border px-3 py-3 text-sm transition ${
                      isSelected
                        ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
                        : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">详细分数</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">默认折叠，不用每次都认真打分。</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDetailedScores((value) => !value)}
            className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-300"
          >
            {showDetailedScores ? '收起' : '展开'}
          </button>
        </div>

        {showDetailedScores ? (
          <>
            <div className="mt-4 flex gap-2">
              {(['simple', 'full'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRecordMode(mode)}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    recordMode === mode
                      ? 'bg-sky-500/15 text-sky-300'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'full' ? '完整' : '极简'}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-5">
              {visibleMetrics.map((metric) => (
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
          </>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">补充记录，可选</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">不写文字也可以，先留下状态就够了。</p>
          </div>
          <button
            type="button"
            onClick={() => setShowNotes((value) => !value)}
            className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-300"
          >
            {showNotes ? '收起' : '展开'}
          </button>
        </div>

        {showNotes ? (
          <div className="mt-4 grid gap-3">
            <label className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天让我有感觉的事</p>
              <textarea
                rows={3}
                value={form.positiveNote}
                onChange={(event) => handleTextChange('positiveNote', event.target.value)}
                placeholder="例如：今天有什么让你感到一点点亮起来？"
                className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              />
            </label>

            <label className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天消耗我的事</p>
              <textarea
                rows={3}
                value={form.drainNote}
                onChange={(event) => handleTextChange('drainNote', event.target.value)}
                placeholder="例如：什么事情带走了你的注意力和电量？"
                className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              />
            </label>

            <label className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">今天完成的一个行动</p>
              <textarea
                rows={3}
                value={form.actionNote}
                onChange={(event) => handleTextChange('actionNote', event.target.value)}
                placeholder="例如：今天真正推进了哪一个现实动作？"
                className="mt-3 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-sky-950/40 transition hover:bg-sky-400"
        >
          保存状态
        </button>
      </div>

      {feedbackRecord && primaryStatus ? (
        <div className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-4">
          <p className="text-sm font-medium text-sky-200">
            {isYesterday ? '已保存昨天状态' : isToday ? '已保存今日状态' : `已保存 ${selectedDate} 的状态`}
          </p>
          <p className="mt-3 text-base font-semibold text-white">当前状态：{primaryStatus.name}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{primaryStatus.message}</p>
          <button
            type="button"
            onClick={() => onSaved(selectedDate)}
            className="mt-4 rounded-2xl border border-sky-400/30 px-4 py-2 text-sm text-sky-200 hover:bg-sky-500/10"
          >
            查看面板
          </button>
        </div>
      ) : null}
    </section>
  )
}