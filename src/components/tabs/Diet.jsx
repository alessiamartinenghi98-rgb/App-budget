import { useMemo, useState } from 'react'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { addDays, toDateKey, parseDateKey, todayKey, formatFullDate } from '../../lib/date.js'

const SEVERITY = [
  { id: 'leggero', label: 'Leggero' },
  { id: 'medio', label: 'Medio' },
  { id: 'forte', label: 'Forte' },
]

export default function Diet() {
  const { data, setDietDay } = useAppData()
  const [dateKey, setDateKey] = useState(todayKey())
  const [showHistory, setShowHistory] = useState(false)

  const entry = data.diet[dateKey] || {}
  const [note, setNote] = useState(entry.sgarroNote || '')
  const [mealLog, setMealLog] = useState(entry.mealLog || '')

  function changeDate(deltaDays) {
    const newKey = toDateKey(addDays(parseDateKey(dateKey), deltaDays))
    setDateKey(newKey)
    const e = data.diet[newKey] || {}
    setNote(e.sgarroNote || '')
    setMealLog(e.mealLog || '')
  }

  function markOk() {
    setDietDay(dateKey, { status: 'ok', sgarroLevel: undefined, sgarroNote: undefined })
    setNote('')
  }

  function markSgarro(level) {
    setDietDay(dateKey, { status: 'sgarro', sgarroLevel: level || entry.sgarroLevel || 'leggero' })
  }

  function saveNote() {
    setDietDay(dateKey, { sgarroNote: note })
  }

  function saveMealLog() {
    setDietDay(dateKey, { mealLog })
  }

  const history = useMemo(
    () => Object.entries(data.diet)
      .filter(([, v]) => v.status)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 30),
    [data.diet],
  )

  return (
    <div className="px-4 pt-6 space-y-4 animate-fadeUp">
      <header className="mb-2">
        <h1 className="font-display text-3xl font-bold text-ink-900">Dieta</h1>
      </header>

      <Card>
        <div className="flex items-center justify-between mb-4">
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

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={markOk}
            className={`py-4 rounded-2xl font-semibold transition-all ${
              entry.status === 'ok' ? 'bg-sage-400 text-white scale-[1.02]' : 'bg-sage-100 text-sage-500'
            }`}
          >
            ✅ Giornata pulita
          </button>
          <button
            onClick={() => markSgarro()}
            className={`py-4 rounded-2xl font-semibold transition-all ${
              entry.status === 'sgarro' ? 'bg-coral-400 text-white scale-[1.02]' : 'bg-coral-100 text-coral-500'
            }`}
          >
            🍩 Sgarro
          </button>
        </div>

        {entry.status === 'sgarro' && (
          <div className="mt-4 space-y-3 animate-fadeUp">
            <div>
              <p className="text-xs text-ink-400 mb-1.5">Gravità</p>
              <div className="flex gap-2">
                {SEVERITY.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => markSgarro(s.id)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                      entry.sgarroLevel === s.id ? 'bg-coral-300 text-white' : 'bg-base-100 text-ink-500'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1.5">Cosa e quanto</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={saveNote}
                rows={2}
                placeholder="es. una pizza e un gelato"
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Diario alimentare (facoltativo)</p>
        <textarea
          value={mealLog}
          onChange={(e) => setMealLog(e.target.value)}
          onBlur={saveMealLog}
          rows={4}
          placeholder="Cosa hai mangiato oggi... (facoltativo, compila solo se vuoi)"
          className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm"
        />
      </Card>

      <Card>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-semibold text-ink-500 uppercase"
        >
          Storico
          <span>{showHistory ? '−' : '+'}</span>
        </button>
        {showHistory && (
          <ul className="mt-3 divide-y divide-base-100">
            {history.map(([key, e]) => (
              <li key={key}>
                <button
                  onClick={() => { setDateKey(key); setNote(e.sgarroNote || ''); setMealLog(e.mealLog || '') }}
                  className="w-full flex items-center justify-between py-2 text-sm text-left"
                >
                  <span className="text-ink-700 capitalize">{formatFullDate(key)}</span>
                  <span>{e.status === 'ok' ? '✅' : `🍩 ${e.sgarroLevel || ''}`}</span>
                </button>
              </li>
            ))}
            {history.length === 0 && <p className="text-ink-400 text-sm py-2">Ancora nessun dato.</p>}
          </ul>
        )}
      </Card>
    </div>
  )
}
