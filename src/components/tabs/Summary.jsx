import { useMemo, useState } from 'react'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { weekRangeOf, monthRangeOf, todayKey, formatFullDate } from '../../lib/date.js'
import { countWorkoutsInRange, countDietInRange, cleanDietStreak } from '../../lib/stats.js'

const QUICK_ADD_ML = [150, 250, 500]

export default function Summary() {
  const { data, addWater, setWaterGoal } = useAppData()
  const today = todayKey()
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(String(data.waterGoalMl))

  const now = new Date()
  const [weekStart, weekEnd] = weekRangeOf(now)
  const [monthStart, monthEnd] = monthRangeOf(now)

  const weekWorkouts = countWorkoutsInRange(data.workoutSessions, weekStart, weekEnd)
  const monthWorkouts = countWorkoutsInRange(data.workoutSessions, monthStart, monthEnd)
  const weekDiet = countDietInRange(data.diet, weekStart, weekEnd)
  const monthDiet = countDietInRange(data.diet, monthStart, monthEnd)

  const streak = useMemo(() => cleanDietStreak(data.diet, today), [data.diet, today])

  const waterToday = data.water[today] || 0
  const waterGoal = data.waterGoalMl
  const waterPct = Math.min(1, waterToday / waterGoal)
  const waterReached = waterToday >= waterGoal

  const encouragement = useMemo(() => {
    if (waterReached) return 'Obiettivo acqua raggiunto! 💧'
    if (streak >= 5) return `${streak} giorni puliti di fila, top! 🔥`
    if (streak >= 2) return `${streak} giorni puliti di fila 👏`
    if (weekWorkouts >= data.workoutGoalWeekly) return 'Obiettivo allenamenti della settimana centrato! 💪'
    return null
  }, [waterReached, streak, weekWorkouts, data.workoutGoalWeekly])

  function saveGoal() {
    const n = Number(goalDraft)
    if (Number.isFinite(n) && n > 0) setWaterGoal(Math.round(n))
    setEditingGoal(false)
  }

  return (
    <div className="px-4 pt-6 space-y-4 animate-fadeUp">
      <header className="mb-2">
        <p className="text-ink-400 text-sm capitalize">{formatFullDate(today)}</p>
        <h1 className="font-display text-3xl font-bold text-ink-900">Riepilogo</h1>
      </header>

      {encouragement && (
        <div className="bg-sage-100 text-ink-700 rounded-2xl px-4 py-2.5 text-sm font-medium animate-bounceIn">
          {encouragement}
        </div>
      )}

      <Card>
        <SectionTitle>Questa settimana</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <FlashStat
            emoji="🏋️"
            value={`${weekWorkouts}/${data.workoutGoalWeekly}`}
            label="Allenamenti"
            color="text-sage-500"
          />
          <FlashStat emoji="🍩" value={weekDiet.sgarri} label="Sgarri" color="text-coral-500" />
          <FlashStat emoji="✅" value={weekDiet.ok} label="Giorni puliti" color="text-powder-500" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Questo mese</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <FlashStat
            emoji="🏋️"
            value={monthWorkouts}
            label="Allenamenti"
            color="text-sage-500"
          />
          <FlashStat emoji="🍩" value={monthDiet.sgarri} label="Sgarri" color="text-coral-500" />
          <FlashStat emoji="✅" value={monthDiet.ok} label="Giorni puliti" color="text-powder-500" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle>Acqua 💧</SectionTitle>
          {editingGoal ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                className="w-20 text-sm rounded-lg border border-base-300 px-2 py-1"
                autoFocus
              />
              <span className="text-xs text-ink-400">ml</span>
              <button onClick={saveGoal} className="text-xs font-semibold text-sage-500 px-2">Ok</button>
            </div>
          ) : (
            <button
              onClick={() => { setGoalDraft(String(data.waterGoalMl)); setEditingGoal(true) }}
              className="text-xs text-ink-400 underline decoration-dotted"
            >
              obiettivo {waterGoal >= 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-4xl font-bold text-powder-500 tabular-nums">
            {waterToday >= 1000 ? (waterToday / 1000).toFixed(2) : waterToday}
          </span>
          <span className="text-ink-400 text-sm mb-1">{waterToday >= 1000 ? 'L' : 'ml'} bevuti oggi</span>
        </div>

        <div className="mt-3 h-3 rounded-full bg-powder-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-powder-400 transition-all duration-500"
            style={{ width: `${waterPct * 100}%` }}
          />
        </div>

        <div className="mt-4 flex gap-2">
          {QUICK_ADD_ML.map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="flex-1 bg-powder-100 hover:bg-powder-200 active:scale-95 transition-all rounded-2xl py-2.5 text-sm font-semibold text-powder-500"
            >
              +{ml}ml
            </button>
          ))}
          <button
            onClick={() => addWater(-250)}
            className="w-11 bg-base-100 hover:bg-base-200 active:scale-95 transition-all rounded-2xl text-ink-400 text-lg font-semibold"
            aria-label="Rimuovi 250ml"
          >
            −
          </button>
        </div>
      </Card>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wide">{children}</h2>
}

function FlashStat({ emoji, value, label, color }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xl mb-0.5">{emoji}</span>
      <span className={`font-display text-2xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[11px] text-ink-400 leading-tight mt-0.5">{label}</span>
    </div>
  )
}
