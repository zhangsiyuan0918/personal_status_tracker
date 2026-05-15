import { useCallback, useMemo, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { DashboardPage } from './pages/DashboardPage'
import { RecordPage } from './pages/RecordPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrendsPage } from './pages/TrendsPage'
import type { NavKey } from './types'
import type { StateRecord } from './types/record'
import { getTodayDate } from './utils/date'
import { getRecordByDate } from './utils/storage'

function App() {
  const [activeTab, setActiveTab] = useState<NavKey>('record')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingDate, setEditingDate] = useState<string | null>(null)

  const today = getTodayDate()
  const todayRecord = useMemo<StateRecord | null>(() => getRecordByDate(today), [today, refreshKey])

  const handleGoToRecord = useCallback(() => {
    setEditingDate(null)
    setActiveTab('record')
  }, [])

  const handleDataChanged = useCallback(() => {
    setRefreshKey((value) => value + 1)
  }, [])

  const handleEditRecord = useCallback((date: string) => {
    setEditingDate(date)
    setActiveTab('record')
  }, [])

  const handleRecordSaved = useCallback(
    (savedDate: string) => {
      handleDataChanged()
      setEditingDate(null)
      setActiveTab(savedDate === today ? 'dashboard' : 'trends')
    },
    [handleDataChanged, today],
  )

  const page = useMemo(() => {
    switch (activeTab) {
      case 'record':
        return <RecordPage editingDate={editingDate} onSaved={handleRecordSaved} />
      case 'dashboard':
        return <DashboardPage record={todayRecord} onGoToRecord={handleGoToRecord} />
      case 'trends':
        return (
          <TrendsPage
            refreshKey={refreshKey}
            onDataChanged={handleDataChanged}
            onEditRecord={handleEditRecord}
          />
        )
      case 'settings':
        return <SettingsPage refreshKey={refreshKey} onDataChanged={handleDataChanged} />
      default:
        return null
    }
  }, [
    activeTab,
    editingDate,
    handleDataChanged,
    handleEditRecord,
    handleGoToRecord,
    handleRecordSaved,
    refreshKey,
    todayRecord,
  ])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-900/95 shadow-2xl shadow-slate-950/40">
        <header className="border-b border-slate-800 px-5 pb-4 pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80">
            Personal Status Tracker
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">个人状态记录器</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            当前已接入记录、面板、趋势、历史、编辑与设置等完整基础能力。
          </p>
        </header>

        <main className="flex-1 px-4 py-5">{page}</main>

        <BottomNav
          activeTab={activeTab}
          onChange={(tab) => {
            if (tab !== 'record') {
              setEditingDate(null)
            }
            setActiveTab(tab)
          }}
        />
      </div>
    </div>
  )
}

export default App