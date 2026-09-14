import { useMemo, useState } from 'react'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { addDays, toDateKey, parseDateKey, todayKey, formatFullDate } from '../../lib/date.js'
import { lastEntryForExercise, formatLastTime, sessionVolume, findScheda } from '../../lib/workout.js'

function buildInitialExercises(scheda, workoutSessions, dateKey) {
  return scheda.esercizi.map((def) => {
    const last = lastEntryForExercise(workoutSessions, def.name, dateKey)
    const setCount = def.defaultSets
    const sets = Array.from({ length: setCount }, (_, i) => ({
      reps: def.defaultReps === 'max' ? 'max' : String(def.defaultReps),
      kg: def.kgApplicable ? (last?.sets[i]?.kg ?? '') : '',
    }))
    return { name: def.name, kgApplicable: def.kgApplicable, sets }
  })
}

const EMPTY_LIBERO = { nome: '', durataMin: '', note: '' }

export default function WorkoutLog() {
  const { data, saveWorkoutSession, deleteWorkoutSession, setActiveProgramId, uid } = useAppData()
  const [dateKey, setDateKey] = useState(todayKey())

  // formMode: null (list) | 'scheda' | 'libero'
  const [formMode, setFormMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formScheda, setFormScheda] = useState(null) // { id, nome }
  const [exercises, setExercises] = useState([])
  const [libero, setLibero] = useState(EMPTY_LIBERO)

  const activeProgram = data.programs.find((p) => p.id === data.activeProgramId) || data.programs[0]
  const sessionsToday = data.workoutSessions.filter((s) => s.date === dateKey)

  function changeDate(delta) {
    setDateKey(toDateKey(addDays(parseDateKey(dateKey), delta)))
    closeForm()
  }

  function closeForm() {
    setFormMode(null)
    setEditingId(null)
    setFormScheda(null)
    setExercises([])
    setLibero(EMPTY_LIBERO)
  }

  function startNewScheda(schedaId) {
    const found = findScheda(data.programs, schedaId)
    if (!found) return
    setFormMode('scheda')
    setEditingId(null)
    setFormScheda({ id: found.scheda.id, nome: found.scheda.nome, programId: found.program.id, programNome: found.program.nome })
    setExercises(buildInitialExercises(found.scheda, data.workoutSessions, dateKey))
  }

  function startNewLibero() {
    setFormMode('libero')
    setEditingId(null)
    setLibero(EMPTY_LIBERO)
  }

  function startEdit(session) {
    if (session.type === 'libero') {
      setFormMode('libero')
      setEditingId(session.id)
      setLibero({ nome: session.nome, durataMin: session.durataMin ?? '', note: session.note || '' })
    } else {
      setFormMode('scheda')
      setEditingId(session.id)
      setFormScheda({ id: session.schedaId, nome: session.schedaNome, programId: session.programId, programNome: session.programNome })
      setExercises(session.esercizi.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })))
    }
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

  function saveScheda() {
    saveWorkoutSession({
      id: editingId || uid('session'),
      type: 'scheda',
      date: dateKey,
      programId: formScheda.programId,
      programNome: formScheda.programNome,
      schedaId: formScheda.id,
      schedaNome: formScheda.nome,
      esercizi: exercises,
    })
    closeForm()
  }

  function saveLibero() {
    if (!libero.nome.trim()) return
    saveWorkoutSession({
      id: editingId || uid('session'),
      type: 'libero',
      date: dateKey,
      nome: libero.nome.trim(),
      durataMin: libero.durataMin === '' ? null : Number(libero.durataMin),
      note: libero.note.trim() || undefined,
    })
    closeForm()
  }

  function remove(id) {
    deleteWorkoutSession(id)
    if (editingId === id) closeForm()
  }

  const volume = useMemo(() => (formMode === 'scheda' ? sessionVolume({ esercizi: exercises }) : null), [formMode, exercises])

  if (!activeProgram) return null

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
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
      </Card>

      {formMode === null && (
        <div className="space-y-3">
          {sessionsToday.map((s) => {
            const v = s.type === 'scheda' ? sessionVolume(s) : null
            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{s.type === 'libero' ? s.nome : s.schedaNome}</p>
                    {s.type === 'libero' ? (
                      <p className="text-xs text-ink-400 mt-0.5">
                        {[s.durataMin ? `${s.durataMin} min` : null, s.note].filter(Boolean).join(' · ') || 'Allenamento libero'}
                      </p>
                    ) : (
                      <p className="text-xs text-ink-400 mt-0.5">
                        {s.esercizi.length} esercizi{v != null ? ` · ${v} kg volume` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0 ml-2">
                    <button onClick={() => startEdit(s)} className="text-xs font-semibold text-sage-500">Modifica</button>
                    <button onClick={() => remove(s.id)} className="text-xs text-ink-400">Elimina</button>
                  </div>
                </div>
              </Card>
            )
          })}

          {sessionsToday.length === 0 && (
            <Card>
              <p className="text-ink-400 text-sm">Nessun allenamento registrato per questo giorno.</p>
            </Card>
          )}

          <Card>
            <p className="text-xs font-semibold text-ink-500 uppercase mb-2">+ Aggiungi allenamento</p>

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
                  onClick={() => startNewScheda(s.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-coral-100 text-coral-500"
                >
                  {s.nome}
                </button>
              ))}
              <button
                onClick={startNewLibero}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-lilac-100 text-lilac-500"
              >
                🏃 Libero
              </button>
            </div>
          </Card>
        </div>
      )}

      {formMode === 'scheda' && formScheda && (
        <div className="space-y-3">
          <Card>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink-900">{formScheda.nome}</p>
              <button onClick={closeForm} className="text-xs text-ink-400">Annulla</button>
            </div>
          </Card>

          {exercises.map((ex, exIdx) => {
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
                      {ex.kgApplicable !== false && (
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
                {editingId && (
                  <button onClick={() => remove(editingId)} className="px-3 py-2.5 rounded-xl bg-base-100 text-ink-500 text-sm font-semibold">
                    Elimina
                  </button>
                )}
                <button onClick={saveScheda} className="px-5 py-2.5 rounded-xl bg-sage-400 text-white text-sm font-semibold">
                  {editingId ? 'Aggiorna' : 'Salva allenamento'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {formMode === 'libero' && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-ink-900">Allenamento libero</p>
            <button onClick={closeForm} className="text-xs text-ink-400">Annulla</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-ink-400">Cosa hai fatto</label>
              <input
                type="text"
                value={libero.nome}
                onChange={(e) => setLibero((l) => ({ ...l, nome: e.target.value }))}
                placeholder="es. Corsa, Nuoto, Yoga, Padel..."
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-ink-400">Durata (minuti, facoltativo)</label>
              <input
                type="number"
                inputMode="numeric"
                value={libero.durataMin}
                onChange={(e) => setLibero((l) => ({ ...l, durataMin: e.target.value }))}
                placeholder="es. 45"
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400">Note (facoltativo)</label>
              <textarea
                value={libero.note}
                onChange={(e) => setLibero((l) => ({ ...l, note: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <button onClick={() => remove(editingId)} className="px-3 py-2.5 rounded-xl bg-base-100 text-ink-500 text-sm font-semibold">
                  Elimina
                </button>
              )}
              <button
                onClick={saveLibero}
                disabled={!libero.nome.trim()}
                className="px-5 py-2.5 rounded-xl bg-lilac-400 text-white text-sm font-semibold disabled:opacity-40"
              >
                {editingId ? 'Aggiorna' : 'Salva allenamento'}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
