import { useRef, useState } from 'react'
import { createJsonExport, exportRecordsAsJson } from '../utils/export'
import { getTodayDate } from '../utils/date'
import {
  clearRecords,
  getAllRecords,
  replaceAllRecords,
} from '../utils/storage'
import {
  mergeRecords,
  parseJsonFileText,
  validateImportedRecords,
} from '../utils/import'

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = useState('')
  const totalRecords = getAllRecords().length
  const exportFileName = `personal-state-records-${getTodayDate()}.json`

  const handleExportJson = () => {
    const records = getAllRecords()

    if (records.length === 0) {
      setMessage('当前没有可导出的记录。')
      return
    }

    const success = exportRecordsAsJson(records, exportFileName)

    if (!success) {
      const fallbackJson = createJsonExport(records)
      window.prompt('导出失败，请手动复制以下 JSON 内容：', fallbackJson)
      setMessage('导出失败，已提供 JSON 文本复制方案。')
      return
    }

    setMessage(`导出成功：${exportFileName}`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setMessage('导入中...')

    try {
      const fileText = await file.text()
      const rawData = parseJsonFileText(fileText)
      const importedRecords = validateImportedRecords(rawData)
      const localRecords = getAllRecords()
      const result = mergeRecords(localRecords, importedRecords)
      const success = replaceAllRecords(result.records)

      if (!success) {
        setMessage('导入失败：无法写入本地数据。')
        return
      }

      setMessage(
        `导入成功，共导入 ${importedRecords.length} 条记录，覆盖 ${result.overwritten} 条，新增 ${result.added} 条。`,
      )
      onDataChanged()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '导入失败：文件读取失败。'
      setMessage(errorMessage)
    } finally {
      event.target.value = ''
    }
  }

  const handleClear = () => {
    const confirmed = window.confirm('确认清空全部记录？此操作不可恢复。')

    if (!confirmed) {
      return
    }

    const success = clearRecords()

    if (!success) {
      setMessage('清空失败，请稍后重试。')
      return
    }

    setMessage('已清空全部数据。')
    onDataChanged()
  }

  return (
    <section className="space-y-4 pb-28">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">设置</p>
        <h2 className="mt-1 text-xl font-semibold text-white">说明与数据管理</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          当前记录总数：{totalRecords} 条（刷新标记：{refreshKey}）
        </p>
        {message ? <p className="mt-3 text-sm leading-6 text-sky-300">{message}</p> : null}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-sm font-medium text-slate-200">数据备份与迁移</h3>
        <div className="mt-3 rounded-2xl bg-slate-950/80 p-4 text-sm leading-6 text-slate-300">
          <p>你的记录保存在当前设备浏览器本地，不会自动同步到其他设备。</p>
          <p className="mt-3">如果你想从电脑迁移到手机：</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>在电脑端导出 JSON；</li>
            <li>将 JSON 文件发送到手机；</li>
            <li>在手机端导入 JSON。</li>
          </ol>
          <p className="mt-3">建议定期导出 JSON 作为备份。</p>
        </div>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleExportJson}
          className="min-h-12 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:border-sky-500/40 hover:text-white"
        >
          导出 JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="min-h-12 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200 hover:bg-sky-500/15"
        >
          导入 JSON
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="min-h-12 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 hover:bg-rose-500/15 sm:col-span-2"
        >
          清空全部数据
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-400">
        你的数据仅保存在当前设备浏览器本地。本应用不会上传你的记录。如果你清除浏览器缓存、更换浏览器或更换设备，数据可能丢失。建议定期导出备份。
      </div>
    </section>
  )
}