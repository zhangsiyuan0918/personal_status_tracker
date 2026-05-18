import { getRecentDateStrings, getTodayDate } from '../utils/date'
import { getPrimaryStatus } from '../utils/statusRules'
import { getRecordMapByDate } from '../utils/statistics'
import type { StateRecord } from '../types/record'

interface RecentRecordsOverviewProps {
  records: StateRecord[]
  days?: number
  onSelectDate: (date: string) => void
}

function formatShortDate(date: string): string {
  return date.slice(5).replace('-', '/')
}

export function RecentRecordsOverview({
  records,
  days = 7,
  onSelectDate,
}: RecentRecordsOverviewProps) {
  const dates = getRecentDateStrings(days)
  const recordMap = getRecordMapByDate(records)
  const today = getTodayDate()

  return (
    <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <div>
        <p className="text-sm font-medium text-white">最近 7 天</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          看看哪些天已经留下状态，点一下就能补记或编辑。
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {dates.map((date) => {
          const record = recordMap[date]
          const primaryStatus = record ? getPrimaryStatus(record) : null
          const isToday = date === today

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-w-28 rounded-2xl border px-3 py-3 text-left transition ${
                record
                  ? 'border-sky-500/25 bg-slate-950/90 text-slate-100'
                  : 'border-slate-800 bg-slate-950/80 text-slate-300'
              } ${isToday ? 'ring-1 ring-sky-400/60' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{formatShortDate(date)}</span>
                {isToday ? (
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-300">
                    今天
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                {primaryStatus ? primaryStatus.name : '未记录'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}