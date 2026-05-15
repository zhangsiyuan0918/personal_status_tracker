import type { CSSProperties } from 'react'
import type { NavKey } from '../types'

interface BottomNavProps {
  activeTab: NavKey
  onChange: (tab: NavKey) => void
}

const navItems: Array<{ key: NavKey; label: string; icon: string }> = [
  { key: 'record', label: '记录', icon: '✍' },
  { key: 'dashboard', label: '面板', icon: '◫' },
  { key: 'trends', label: '趋势', icon: '⌁' },
  { key: 'settings', label: '设置', icon: '⚙' },
]

const safeAreaStyle = {
  paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
} satisfies CSSProperties

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="sticky bottom-0 grid grid-cols-4 border-t border-slate-800 bg-slate-950/95 px-2 pt-2 backdrop-blur"
      style={safeAreaStyle}
    >
      {navItems.map((item) => {
        const isActive = item.key === activeTab

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`min-h-14 flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs transition ${
              isActive
                ? 'bg-sky-500/15 text-sky-300'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}