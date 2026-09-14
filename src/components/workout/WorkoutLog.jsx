import { useEffect, useMemo, useState } from 'react'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { addDays, toDateKey, parseDateKey, todayKey, formatFullDate } from '../../lib/date.js'
import { lastEntryForExercise, formatLastTime, sessionVolume } from '../../lib/workout.js'

function buildInitialExercises(scheda, existingSession, workoutSessions, dateKey) {
  return scheda.esercizi.map((def) => {
    const existing = existingSession?.esercizi.find((e) => e.name === def.name)
    if (existing) return { ...existing }

    const last = lastEntryForExercise(workoutSessions, def.name, dateKey)
    const setCount = def.defaultSets
    const sets = Array.from({ length: setCount }, (_, i) => ({
      reps: def.defaultReps === 'max' ? 'max' : String(def.defaultReps),
      kg: def.kgApplicable ? (last?.sets[i]?.kg ?? '') : '',
    }))
    return { name: def.name, kgApplicable: def.kgApplicable, sets }
  })
}

export default function WorkoutLog() {
  const { data, saveWorkoutSession, deleteWorkoutSession, setActiveProgramId, uid } = useAppData()
  const [dateKey, setDateKey] = useState(todayKey())

  const activeProgram = data.programs.find((p) => p.id === data.activeProgramId) || data.programs[0]
  const [schedaId, setSchedaId] = useState(activeProgram?.schede[0]?.id)

  const scheda = activeProgram?.schede.find((s) => s.id === schedaId) || activeProgram?.schede[0]

  const existingSession = data.workoutSessions.find((s) => s.date === dateKey && s.schedaId === scheda?.id)

  const [exercises, setExercises] = useState(() =>
    scheda ? buildInitialExercises(scheda, existingSession, data.workoutSessions, dateKey) : [],
  )

  useEffect(() => {
    if (!scheda) return
    const existing = data.workoutSessions.find((s) => s.date === dateKey && s.schedaId === scheda.id)
    setExercises(buildInitialExercises(scheda, existing, data.workoutSessions, dateKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, scheda?.id])

  function changeDate(delta) {
    setDateKey(toDateKey(addDays(parseDateKey(dateKey), delta)))
  }

  function updateSet(exIdx, setIdx, field, value) {
    setExercises((prev) => {
      const next = [...prev]
      const sets = [...next[exIdx].sets]
      sets[setIdx] = { ...sets[setIdx], [field]: value }
      next[exIdx] = { ...next[exIdx], sets }
      return next
    })
  }

  function save() {
    const session = {
      id: existingSession?.id || uid('session'),
      date: dateKey,
      programId: activeProgram.id,
      programNome: activeProgram.nome,
      schedaId: scheda.id,
      schedaNome: scheda.nome,
      esercizi: exercises,
    }
    saveWorkoutSession(session)
  }

  function remove() {
    if (existingSession) deleteWorkoutSession(existingSession.id)
  }

  const volume = useMemo(() => sessionVolume({ esercizi: exercises }), [exercises])

  if (!activeProgram) return null

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => changeDate(-1)} className="w-8 h-8 rounded-full bg-base-100 text-ink-500">‹</button>
          <p className="text-sm font-semibold text-ink-700 capitalize">{formatFullDate(dateKey)}</p>
          <button
            onClick={() => changeDate(1)}
            disabled={dateKey >= todayKey()}
            className="w-8 h-8 rounded-full bg-base-100 text-ink-500 disabled:opacity-30"
          >
            ›
          </button>
        </div>

        {data.programs.length > 1 && (
          <select
            value={activeProgram.id}
            onChange={(e) => setActiveProgramId(e.target.value)}
            className="w-full mb-2 rounded-xl border border-base-300 px-3 py-2 text-sm bg-white"
          >
            {[...data.programs].reverse().map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {activeProgram.schede.map((s) => (
            <button
              key={s.id}
              onClick={() => setSchedaId(s.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                scheda?.id === s.id ? 'bg-coral-400 text-white' : 'bg-coral-100 text-coral-500'
              }`}
            >
              {s.nome}
            </button>
          ))}
        </div>
      </Card>

      {scheda && (
        <div className="space-y-3">
          {exercises.map((ex, exIdx) => {
            const def = scheda.esercizi.find((d) => d.name === ex.name)
            const last = lastEntryForExercise(data.workoutSessions, ex.name, dateKey)
            return (
              <Card key={ex.name}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-semibold text-ink-900">{ex.name}</p>
                  {last && (
                    <p className="text-[11px] text-ink-400">ultima volta: {formatLastTime(last)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <span className="text-xs text-ink-400 w-10">Serie {setIdx + 1}</span>
                      {def?.kgApplicable !== false && (
                        <input
                          type="number"
                          step="0.5"
                          inputMode="decimal"
                          value={set.kg}
                          onChange={(e) => updateSet(exIdx, setIdx, 'kg', e.target.value)}
                          placeholder="kg"
                          className="w-16 rounded-lg border border-base-300 px-2 py-1.5 text-sm text-center"
                        />
                      )}
                      <span className="text-ink-300 text-xs">×</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        placeholder="rip."
                        className="w-16 rounded-lg border border-base-300 px-2 py-1.5 text-sm text-center"
                      />
                      <span className="text-xs text-ink-400">rip.</span>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-400">Volume di lavoro</p>
                <p className="font-display text-xl font-bold text-ink-900">{volume != null ? `${volume} kg` : '—'}</p>
              </div>
              <div className="flex gap-2">
                {existingSession && (
                  <button onClick={remove} className="px-3 py-2.5 rounded-xl bg-base-100 text-ink-500 text-sm font-semibold">
                    Elimina
                  </button>
                )}
                <button onClick={save} className="px-5 py-2.5 rounded-xl bg-sage-400 text-white text-sm font-semibold">
                  {existingSession ? 'Aggiorna' : 'Salva allenamento'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
