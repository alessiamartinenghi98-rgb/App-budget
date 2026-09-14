const TABS = [
  { id: 'riepilogo', label: 'Riepilogo', icon: HomeIcon },
  { id: 'daily', label: 'Daily', icon: CalendarIcon },
  { id: 'dieta', label: 'Dieta', icon: AppleIcon },
  { id: 'allenamento', label: 'Allenamento', icon: DumbbellIcon },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom bg-base-50/90 backdrop-blur border-t border-base-200">
      <div className="mx-auto max-w-md flex">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all ${
                  isActive ? 'bg-sage-200 scale-105' : 'bg-transparent'
                }`}
              >
                <Icon active={isActive} />
              </span>
              <span
                className={`text-[11px] font-medium ${isActive ? 'text-ink-900' : 'text-ink-400'}`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#4A6741' : '#9A948A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function CalendarIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#4A6741' : '#9A948A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function AppleIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#4A6741' : '#9A948A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 8.5c1.8-.2 3 .9 3.7 2 -2.6 1.5-2.1 5 .4 6-0.6 1.5-1.4 3-2.9 3-1.2 0-1.6-.8-3-.8s-1.9.8-3 .8c-1.4 0-2.4-1.4-3-2.8C6.7 14 6.9 9.8 9.6 8.2c1-.6 2-.6 2.9-.3" />
      <path d="M13.5 5c.3-1.3 1.5-2.3 2.8-2.3.1 1.3-.4 2.5-1.1 3.3-.7.8-1.8 1.5-2.9 1.4-.2-1.2.4-2.5 1.2-3.4Z" />
    </svg>
  )
}

function DumbbellIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#4A6741' : '#9A948A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6M2 10.5v3M20 9v6M22 10.5v3M7 12h10" />
      <rect x="5" y="7.5" width="3" height="9" rx="1" />
      <rect x="16" y="7.5" width="3" height="9" rx="1" />
    </svg>
  )
}
