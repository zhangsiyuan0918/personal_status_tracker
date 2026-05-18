import { RecentRecordsOverview } from '../components/RecentRecordsOverview'
import type { StateRecord } from '../types/record'
import { getTodayDate } from '../utils/date'
import { getStatuses } from '../utils/statusRules'
import { getCoverageMessage, getRecentRecordCoverage } from '../utils/statistics'

interface DashboardPageProps {
  record: StateRecord | null
  records: StateRecord[]
  onGoToRecord: () => void
  onSelectDate: (date: string) => void
}

const metrics = [
  { key: 'energy', label: '能量值', color: 'bg-emerald-400' },
  { key: 'spark', label: '火苗值', color: 'bg-amber-400' },
  { key: 'action', label: '行动力', color: 'bg-sky-400' },
  { key: 'connection', label: '连接值', color: 'bg-violet-400' },
  { key: 'expression', label: '表达值', color: 'bg-pink-400' },
  { key: 'stability', label: '情绪稳定值', color: 'bg-cyan-400' },
] as const

export function DashboardPage({
  record,
  records,
  onGoToRecord,
  onSelectDate,
}: DashboardPageProps) {
  const today = getTodayDate()
  const coverage = getRecentRecordCoverage(records, 7)

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          最近 7 天已记录：{coverage.recorded} / {coverage.total} 天
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {getCoverageMessage(coverage.recorded)}
        </p>
      </div>

      <RecentRecordsOverview records={records} onSelectDate={onSelectDate} />

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">日期：{today}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">今日状态</h2>

        {!record ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-5 text-center">
            <p className="text-base font-medium text-white">今天还没有记录。</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              不用写很多，点几个接近的状态就行。
            </p>
            <button
              type="button"
              onClick={onGoToRecord}
              className="mt-4 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              记录今天
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-sm font-medium text-sky-200">今天已记录。</p>
              <button
                type="button"
                onClick={() => onSelectDate(today)}
                className="mt-3 rounded-2xl border border-sky-400/30 px-4 py-2 text-sm text-sky-200 hover:bg-sky-500/10"
              >
                编辑今天
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {metrics.map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">{metric.label}</span>
                    <span className="font-medium text-white">
                      {record[metric.key]}
                      /10
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${record[metric.key] * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm font-medium text-slate-300">当前状态</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getStatuses(record).map((status) => (
                  <span
                    key={status.key}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200"
                  >
                    {status.name}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {getStatuses(record).map((status) => (
                  <article key={status.key} className="rounded-2xl bg-slate-950/80 p-3">
                    <p className="text-sm font-medium text-white">{status.name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{status.message}</p>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}