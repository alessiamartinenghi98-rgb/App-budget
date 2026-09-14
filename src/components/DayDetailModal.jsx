import { useAppData } from '../context/AppDataContext.jsx'
import { formatFullDate } from '../lib/date.js'

const SGARRO_LABELS = { leggero: 'Leggero', medio: 'Medio', forte: 'Forte' }

export default function DayDetailModal({ dateKey, onClose }) {
  const { data } = useAppData()
  const diet = data.diet[dateKey]
  const sessions = data.workoutSessions.filter((s) => s.date === dateKey)
  const waterMl = data.water[dateKey] || 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-base-50 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto animate-fadeUp">
        <div className="w-10 h-1.5 bg-base-300 rounded-full mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-ink-900 capitalize mb-4">{formatFullDate(dateKey)}</h3>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs font-semibold text-sage-500 uppercase mb-1">Dieta</p>
            {!diet?.status && <p className="text-ink-400 text-sm">Nessun dato registrato.</p>}
            {diet?.status === 'ok' && <p className="text-ink-700 text-sm">✅ Giornata seguita bene</p>}
            {diet?.status === 'sgarro' && (
              <div className="text-sm text-ink-700">
                <p>🍩 Sgarro — livello {SGARRO_LABELS[diet.sgarroLevel] || '—'}</p>
                {diet.sgarroNote && <p className="text-ink-500 mt-1">{diet.sgarroNote}</p>}
              </div>
            )}
            {diet?.mealLog && (
              <div className="mt-2 pt-2 border-t border-base-100">
                <p className="text-xs text-ink-400 mb-1">Diario alimentare</p>
                <p className="text-sm text-ink-700 whitespace-pre-wrap">{diet.mealLog}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs font-semibold text-coral-500 uppercase mb-1">
              Allenamento{sessions.length > 1 ? ` (${sessions.length})` : ''}
            </p>
            {sessions.length === 0 && <p className="text-ink-400 text-sm">Nessun allenamento registrato.</p>}
            {sessions.map((session, si) => (
              <div key={session.id} className={si > 0 ? 'mt-3 pt-3 border-t border-base-100' : ''}>
                {session.type === 'libero' ? (
                  <div>
                    <p className="text-sm font-semibold text-ink-900 mb-1">🏃 {session.nome}</p>
                    <p className="text-sm text-ink-500">
                      {[session.durataMin ? `${session.durataMin} min` : null, session.note].filter(Boolean).join(' · ') || 'Allenamento libero'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-ink-900 mb-2">{session.schedaNome}</p>
                    <ul className="space-y-2">
                      {session.esercizi.map((ex, i) => (
                        <li key={i} className="text-sm text-ink-700">
                          <span className="font-medium">{ex.name}</span>
                          <span className="text-ink-400">
                            {' '}
                            — {ex.sets.map((s, j) => (
                              <span key={j}>
                                {j > 0 && ', '}
                                {ex.kgApplicable && s.kg ? `${s.kg}kg × ` : ''}
                                {s.reps || '-'}
                              </span>
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs font-semibold text-powder-500 uppercase mb-1">Acqua</p>
            <p className="text-sm text-ink-700">
              {waterMl >= 1000 ? `${(waterMl / 1000).toFixed(2)}L` : `${waterMl}ml`} su{' '}
              {data.waterGoalMl >= 1000 ? `${(data.waterGoalMl / 1000).toFixed(1)}L` : `${data.waterGoalMl}ml`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-base-100 text-ink-700 font-semibold"
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
