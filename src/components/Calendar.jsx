import ActivityRing from './ActivityRing.jsx'
import { daysInMonthGrid, toDateKey, WEEKDAY_LABELS_IT, MONTH_NAMES_IT, todayKey } from '../lib/date.js'

export default function Calendar({ year, month, data, onPrevMonth, onNextMonth, onSelectDay, selectedKey }) {
  const days = daysInMonthGrid(year, month)
  const today = todayKey()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-base-100 text-ink-500 active:scale-90 transition-transform">
          ‹
        </button>
        <h3 className="font-display text-lg font-bold text-ink-900 capitalize">
          {MONTH_NAMES_IT[month]} {year}
        </h3>
        <button onClick={onNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-base-100 text-ink-500 active:scale-90 transition-transform">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 mb-1">
        {WEEKDAY_LABELS_IT.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-ink-400">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {days.map((d) => {
          const key = toDateKey(d)
          const inMonth = d.getMonth() === month
          const dietOk = data.diet[key]?.status === 'ok'
          const workoutDone = data.workoutSessions.some((s) => s.date === key)
          const waterRatio = Math.min(1, (data.water[key] || 0) / data.waterGoalMl)
          const isToday = key === today
          const isSelected = key === selectedKey

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
                isSelected ? 'bg-sage-100' : ''
              } ${!inMonth ? 'opacity-30' : ''}`}
            >
              <div className="relative">
                <ActivityRing
                  size={26}
                  strokeWidth={2.6}
                  gap={1.4}
                  rings={[
                    { value: dietOk ? 1 : 0, color: '#82A96E', trackColor: '#E7EEE3' },
                    { value: workoutDone ? 1 : 0, color: '#DB6F55', trackColor: '#FBE7E2' },
                    { value: waterRatio, color: '#6892AB', trackColor: '#E4EEF2' },
                  ]}
                />
              </div>
              <span className={`text-[11px] mt-0.5 ${isToday ? 'font-bold text-sage-500' : 'text-ink-700'}`}>
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-ink-400">
        <LegendDot color="#82A96E" label="Dieta" />
        <LegendDot color="#DB6F55" label="Allenamento" />
        <LegendDot color="#6892AB" label="Acqua" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
