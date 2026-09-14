import { useState } from 'react'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { todayKey, formatDayMonth } from '../../lib/date.js'

export default function ProgramManager() {
  const { data, addProgram, updateProgram, setActiveProgramId, uid } = useAppData()
  const [viewingId, setViewingId] = useState(data.activeProgramId)

  const program = data.programs.find((p) => p.id === viewingId) || data.programs[0]

  function createNewProgram() {
    const base = data.programs.find((p) => p.id === data.activeProgramId) || data.programs[0]
    const newProgram = {
      id: uid('programma'),
      nome: `Programma ${data.programs.length + 1}`,
      startDate: todayKey(),
      durationWeeks: 6,
      schede: base.schede.map((s) => ({
        id: uid('scheda'),
        nome: s.nome,
        esercizi: s.esercizi.map((e) => ({ ...e })),
      })),
    }
    addProgram(newProgram)
    setViewingId(newProgram.id)
  }

  function renameProgram(nome) {
    updateProgram(program.id, (p) => ({ ...p, nome }))
  }

  function addScheda() {
    const letter = String.fromCharCode(65 + program.schede.length)
    updateProgram(program.id, (p) => ({
      ...p,
      schede: [...p.schede, { id: uid('scheda'), nome: `Scheda ${letter}`, esercizi: [] }],
    }))
  }

  function removeScheda(schedaId) {
    updateProgram(program.id, (p) => ({ ...p, schede: p.schede.filter((s) => s.id !== schedaId) }))
  }

  function renameScheda(schedaId, nome) {
    updateProgram(program.id, (p) => ({
      ...p,
      schede: p.schede.map((s) => (s.id === schedaId ? { ...s, nome } : s)),
    }))
  }

  function addExercise(schedaId) {
    updateProgram(program.id, (p) => ({
      ...p,
      schede: p.schede.map((s) =>
        s.id === schedaId
          ? { ...s, esercizi: [...s.esercizi, { name: 'Nuovo esercizio', defaultSets: 3, defaultReps: 10, kgApplicable: true }] }
          : s,
      ),
    }))
  }

  function updateExercise(schedaId, idx, patch) {
    updateProgram(program.id, (p) => ({
      ...p,
      schede: p.schede.map((s) =>
        s.id === schedaId
          ? { ...s, esercizi: s.esercizi.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }
          : s,
      ),
    }))
  }

  function removeExercise(schedaId, idx) {
    updateProgram(program.id, (p) => ({
      ...p,
      schede: p.schede.map((s) => (s.id === schedaId ? { ...s, esercizi: s.esercizi.filter((_, i) => i !== idx) } : s)),
    }))
  }

  if (!program) return null

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Programmi</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[...data.programs].reverse().map((p) => (
            <button
              key={p.id}
              onClick={() => setViewingId(p.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold ${
                viewingId === p.id ? 'bg-ink-900 text-white' : 'bg-base-100 text-ink-500'
              }`}
            >
              {p.nome}
              {p.id === data.activeProgramId && ' ⭐'}
            </button>
          ))}
        </div>
        <button
          onClick={createNewProgram}
          className="w-full mt-3 py-2.5 rounded-xl bg-lilac-200 text-ink-700 text-sm font-semibold"
        >
          + Nuovo programma (nuovo ciclo)
        </button>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2 mb-1">
          <input
            value={program.nome}
            onChange={(e) => renameProgram(e.target.value)}
            className="font-display text-lg font-bold text-ink-900 bg-transparent flex-1"
          />
          {program.id !== data.activeProgramId && (
            <button
              onClick={() => setActiveProgramId(program.id)}
              className="text-xs font-semibold text-sage-500 bg-sage-100 rounded-full px-3 py-1.5 shrink-0"
            >
              Usa per il log
            </button>
          )}
        </div>
        <p className="text-xs text-ink-400">
          Iniziato il {formatDayMonth(program.startDate)} · {program.durationWeeks} settimane
        </p>
      </Card>

      {program.schede.map((scheda) => (
        <Card key={scheda.id}>
          <div className="flex items-center justify-between mb-3">
            <input
              value={scheda.nome}
              onChange={(e) => renameScheda(scheda.id, e.target.value)}
              className="font-semibold text-ink-900 bg-transparent flex-1"
            />
            <button onClick={() => removeScheda(scheda.id)} className="text-ink-400 text-xs shrink-0">
              elimina scheda
            </button>
          </div>

          <div className="space-y-2">
            {scheda.esercizi.map((ex, idx) => (
              <div key={idx} className="bg-base-50 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(scheda.id, idx, { name: e.target.value })}
                    className="flex-1 rounded-lg border border-base-300 px-2 py-1.5 text-sm bg-white"
                  />
                  <button onClick={() => removeExercise(scheda.id, idx)} className="text-ink-400 text-xs shrink-0">×</button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-ink-400">
                    serie
                    <input
                      type="number"
                      value={ex.defaultSets}
                      onChange={(e) => updateExercise(scheda.id, idx, { defaultSets: Number(e.target.value) || 1 })}
                      className="w-12 rounded-lg border border-base-300 px-1.5 py-1 text-center bg-white"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-ink-400">
                    rip.
                    <input
                      value={ex.defaultReps}
                      onChange={(e) => updateExercise(scheda.id, idx, { defaultReps: e.target.value })}
                      className="w-14 rounded-lg border border-base-300 px-1.5 py-1 text-center bg-white"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-ink-400 ml-auto">
                    <input
                      type="checkbox"
                      checked={ex.kgApplicable !== false}
                      onChange={(e) => updateExercise(scheda.id, idx, { kgApplicable: e.target.checked })}
                    />
                    kg
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => addExercise(scheda.id)}
            className="w-full mt-2.5 py-2 rounded-xl bg-coral-100 text-coral-500 text-sm font-semibold"
          >
            + Aggiungi esercizio
          </button>
        </Card>
      ))}

      <button onClick={addScheda} className="w-full py-2.5 rounded-xl bg-base-100 text-ink-500 text-sm font-semibold">
        + Aggiungi scheda
      </button>
    </div>
  )
}
