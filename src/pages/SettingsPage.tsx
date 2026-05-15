import { createJsonExport, exportRecordsAsJson } from '../utils/export'
import { clearRecords, getAllRecords } from '../utils/storage'
import { getTodayDate } from '../utils/date'

interface SettingsPageProps {
  refreshKey: number
  onDataChanged: () => void
}

const metricNotes = [
  '能量值：表示今天身体和精神的基础电量。',
  '火苗值：表示今天是否有兴趣、期待和投入感。',
  '行动力：表示今天是否把想法推进成了现实动作。',
  '连接值：表示今天是否与人产生了真实连接。',
  '表达值：表示今天是否表达了真实想法、需求或边界。',
  '情绪稳定值：表示今天内心是否稳定，越高越稳定。',
]

const statusNotes = [
  '恢复状态：能量值 <= 4',
  '内耗状态：情绪稳定值 <= 4 且行动力 <= 4',
  '低燃烧预警：火苗值 <= 3 且行动力 <= 5',
  '孤岛状态：连接值 <= 3 且表达值 <= 3',
  '点燃状态：火苗值 >= 7 且行动力 >= 7',
  '稳定运行：未命中其他状态时默认显示',
]

export function SettingsPage({ refreshKey, onDataChanged }: SettingsPageProps) {
  const totalRecords = getAllRecords().length
  const exportFileName = `personal-state-records-${getTodayDate()}.json`

  const handleExportJson = () => {
    const records = getAllRecords()

    if (records.length === 0) {
      window.alert('当前没有可导出的记录。')
      return
    }

    const success = exportRecordsAsJson(records, exportFileName)

    if (!success) {
      const fallbackJson = createJsonExport(records)
      window.prompt('导出失败，请手动复制以下 JSON 内容：', fallbackJson)
    }
  }

  const handleClear = () => {
    const confirmed = window.confirm('确认清空全部记录？此操作不可恢复。')

    if (!confirmed) {
      return
    }

    const success = clearRecords()

    if (!success) {
      window.alert('清空失败，请稍后重试。')
      return
    }

    onDataChanged()
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">设置</p>
        <h2 className="mt-1 text-xl font-semibold text-white">说明与数据管理</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          当前记录总数：{totalRecords} 条（刷新标记：{refreshKey}）
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-sm font-medium text-slate-200">指标说明</h3>
        <div className="mt-3 space-y-2">
          {metricNotes.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-slate-950/80 p-3 text-sm leading-6 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-sm font-medium text-slate-200">状态规则说明</h3>
        <div className="mt-3 space-y-2">
          {statusNotes.map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-slate-950/80 p-3 text-sm leading-6 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleExportJson}
          className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:border-sky-500/40 hover:text-white"
        >
          导出 JSON
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 hover:bg-rose-500/15"
        >
          清空全部数据
        </button>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-400">
        你的记录仅保存在当前设备浏览器本地。本应用不会上传你的数据，建议定期导出备份。
      </div>
    </section>
  )
}