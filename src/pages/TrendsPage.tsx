import { useMemo, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { deleteRecord, getAllRecords } from '../utils/storage'
import { getRecent30DaysRecords, getRecent7DaysRecords } from '../utils/date'
import { getStatuses } from '../utils/statusRules'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

interface TrendsPageProps {
  refreshKey: number
  onDataChanged: () => void
  onEditRecord: (date: string) => void
}

type TrendsTab = 'chart' | 'history'
type RangeKey = '7' | '30'

const tabButtonClass = 'rounded-2xl px-4 py-2 text-sm transition'
const activeTabClass = 'bg-sky-500/15 text-sky-300'
const inactiveTabClass = 'bg-slate-950/80 text-slate-400 hover:text-white'

const metricConfigs = [
  { key: 'spark', label: '火苗值', color: '#fbbf24' },
  { key: 'action', label: '行动力', color: '#38bdf8' },
  { key: 'connection', label: '连接值', color: '#a78bfa' },
  { key: 'stability', label: '情绪稳定值', color: '#22d3ee' },
] as const

export function TrendsPage({ refreshKey, onDataChanged, onEditRecord }: TrendsPageProps) {
  const [activeTab, setActiveTab] = useState<TrendsTab>('chart')
  const [range, setRange] = useState<RangeKey>('7')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const records = useMemo(() => getAllRecords(), [refreshKey])
  const trendRecords = useMemo(
    () =>
      range === '7'
        ? getRecent7DaysRecords(records).reverse()
        : getRecent30DaysRecords(records).reverse(),
    [range, records],
  )

  const chartData = useMemo(
    () => ({
      labels: trendRecords.map((record) => record.date),
      datasets: metricConfigs.map((metric) => ({
        label: metric.label,
        data: trendRecords.map((record) => record[metric.key]),
        borderColor: metric.color,
        backgroundColor: `${metric.color}33`,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 4,
        fill: false,
      })),
    }),
    [trendRecords],
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#cbd5e1',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.35)',
          },
        },
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.35)',
          },
        },
      },
    }),
    [],
  )

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('确认删除这条记录？\n删除后不可恢复。')

    if (!confirmed) {
      return
    }

    const success = deleteRecord(id)

    if (!success) {
      window.alert('删除失败，请稍后重试。')
      return
    }

    if (expandedId === id) {
      setExpandedId(null)
    }

    onDataChanged()
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">历史与趋势</p>
        <h2 className="mt-1 text-xl font-semibold text-white">趋势图 / 历史记录</h2>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`${tabButtonClass} ${activeTab === 'chart' ? activeTabClass : inactiveTabClass}`}
          >
            趋势图
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`${tabButtonClass} ${activeTab === 'history' ? activeTabClass : inactiveTabClass}`}
          >
            历史记录
          </button>
        </div>
      </div>

      {activeTab === 'chart' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRange('7')}
              className={`${tabButtonClass} ${range === '7' ? activeTabClass : inactiveTabClass}`}
            >
              最近 7 天
            </button>
            <button
              type="button"
              onClick={() => setRange('30')}
              className={`${tabButtonClass} ${range === '30' ? activeTabClass : inactiveTabClass}`}
            >
              最近 30 天
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            {trendRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-5 text-center">
                <p className="text-base font-medium text-white">数据还不够。</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  连续记录几天后，这里会显示趋势。
                </p>
              </div>
            ) : (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-5 text-center">
              <p className="text-base font-medium text-white">还没有任何记录。</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">从今天开始记录自己的状态。</p>
            </div>
          ) : (
            records.map((record) => {
              const statuses = getStatuses(record)
              const isExpanded = expandedId === record.id

              return (
                <article key={record.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="w-full text-left"
                  >
                    <p className="text-base font-semibold text-white">{record.date}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      能量 {record.energy}｜火苗 {record.spark}｜行动 {record.action}｜连接{' '}
                      {record.connection}｜表达 {record.expression}｜稳定 {record.stability}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      状态：{statuses.map((status) => status.name).join(' / ')}
                    </p>
                  </button>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="rounded-2xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white"
                    >
                      {isExpanded ? '收起详情' : '查看详情'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditRecord(record.date)}
                      className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-200"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                    >
                      删除
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 space-y-3 rounded-2xl bg-slate-950/80 p-4 text-sm leading-6 text-slate-300">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          今天让我有感觉的事
                        </p>
                        <p className="mt-1">{record.positiveNote || '未填写'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          今天消耗我的事
                        </p>
                        <p className="mt-1">{record.drainNote || '未填写'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          今天完成的一个行动
                        </p>
                        <p className="mt-1">{record.actionNote || '未填写'}</p>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })
          )}
        </div>
      )}
    </section>
  )
}