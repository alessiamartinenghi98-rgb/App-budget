import { useState } from 'react'
import Card from '../Card.jsx'
import WorkoutLog from '../workout/WorkoutLog.jsx'
import ExerciseProgress from '../workout/ExerciseProgress.jsx'
import ProgramManager from '../workout/ProgramManager.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { weekRangeOf, monthRangeOf } from '../../lib/date.js'
import { countWorkoutsInRange } from '../../lib/stats.js'

const SUBTABS = [
  { id: 'log', label: 'Oggi' },
  { id: 'progressi', label: 'Progressi' },
  { id: 'schede', label: 'Schede' },
]

export default function Workout() {
  const { data, setWorkoutGoalWeekly } = useAppData()
  const [sub, setSub] = useState('log')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(String(data.workoutGoalWeekly))

  const now = new Date()
  const [weekStart, weekEnd] = weekRangeOf(now)
  const [monthStart, monthEnd] = monthRangeOf(now)
  const weekCount = countWorkoutsInRange(data.workoutSessions, weekStart, weekEnd)
  const monthCount = countWorkoutsInRange(data.workoutSessions, monthStart, monthEnd)

  function saveGoal() {
    const n = Number(goalDraft)
    if (Number.isFinite(n) && n > 0) setWorkoutGoalWeekly(Math.round(n))
    setEditingGoal(false)
  }

  return (
    <div className="px-4 pt-6 space-y-4 animate-fadeUp">
      <header className="mb-2">
        <h1 className="font-display text-3xl font-bold text-ink-900">Allenamento</h1>
      </header>

      <Card>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-coral-500 tabular-nums">
              {weekCount}/{editingGoal ? '' : data.workoutGoalWeekly}
            </p>
            {editingGoal ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  className="w-12 text-xs rounded-lg border border-base-300 px-1 py-0.5 text-center"
                  autoFocus
                />
                <button onClick={saveGoal} className="text-xs font-semibold text-sage-500">Ok</button>
              </div>
            ) : (
              <button
                onClick={() => { setGoalDraft(String(data.workoutGoalWeekly)); setEditingGoal(true) }}
                className="text-[11px] text-ink-400 underline decoration-dotted"
              >
                settimana
              </button>
            )}
          </div>
          <div className="w-px h-10 bg-base-200" />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-sage-500 tabular-nums">{monthCount}</p>
            <p className="text-[11px] text-ink-400">questo mese</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 bg-base-100 rounded-2xl p-1">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              sub === t.id ? 'bg-white shadow-soft text-ink-900' : 'text-ink-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'log' && <WorkoutLog />}
      {sub === 'progressi' && <ExerciseProgress />}
      {sub === 'schede' && <ProgramManager />}
    </div>
  )
}
