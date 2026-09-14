import { useMemo, useState } from 'react'
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import Card from '../Card.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'
import { allExerciseNames, exerciseHistory, summarizeEntry, exerciseVolume } from '../../lib/workout.js'
import { formatDayMonth, MONTH_NAMES_IT } from '../../lib/date.js'

export default function ExerciseProgress() {
  const { data } = useAppData()
  const names = useMemo(() => allExerciseNames(data.programs), [data.programs])
  const [selected, setSelected] = useState(names[0] || '')
  const [monthOnly, setMonthOnly] = useState(false)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const history = useMemo(() => (selected ? exerciseHistory(data.workoutSessions, selected) : []), [
    data.workoutSessions,
    selected,
  ])

  const filtered = useMemo(() => {
    if (!monthOnly) return history
    return history.filter((h) => {
      const d = new Date(h.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [history, monthOnly, year, month])

  const chartData = useMemo(
    () =>
      filtered.map((entry) => {
        const s = summarizeEntry(entry)
        return {
          label: formatDayMonth(entry.date),
          date: entry.date,
          kg: s.avgKg,
          reps: s.avgReps,
          hasMax: s.hasMax,
          volume: exerciseVolume(entry),
          schedaNome: entry.schedaNome,
        }
      }),
    [filtered],
  )

  const kgApplicable = history[0]?.kgApplicable !== false

  if (names.length === 0) {
    return (
      <Card>
        <p className="text-ink-400 text-sm">Registra un allenamento per vedere qui la progressione.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Esercizio</p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm bg-white"
        >
          {names.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setMonthOnly(false)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!monthOnly ? 'bg-lilac-300 text-white' : 'bg-lilac-100 text-lilac-500'}`}
          >
            Tutto lo storico
          </button>
          <button
            onClick={() => setMonthOnly(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${monthOnly ? 'bg-lilac-300 text-white' : 'bg-lilac-100 text-lilac-500'}`}
          >
            Vista mensile
          </button>
        </div>

        {monthOnly && (
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }}
              className="w-8 h-8 rounded-full bg-base-100 text-ink-500"
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-ink-700 capitalize">{MONTH_NAMES_IT[month]} {year}</p>
            <button
              onClick={() => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }}
              className="w-8 h-8 rounded-full bg-base-100 text-ink-500"
            >
              ›
            </button>
          </div>
        )}
      </Card>

      {chartData.length === 0 && (
        <Card>
          <p className="text-ink-400 text-sm">Nessun dato per questo periodo.</p>
        </Card>
      )}

      {chartData.length > 0 && (
        <>
          <Card>
            <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Kg e ripetizioni nel tempo</p>
            <div className="h-56 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9A948A' }} axisLine={false} tickLine={false} />
                  {kgApplicable && (
                    <YAxis
                      yAxisId="kg"
                      tick={{ fontSize: 10, fill: '#DB6F55' }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                  )}
                  <YAxis
                    yAxisId="reps"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#6892AB' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    domain={[0, 'dataMax + 3']}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(46,43,39,0.12)', fontSize: 12 }}
                    formatter={(value, name) => [value, name === 'kg' ? 'kg (media)' : 'rip. (media)']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {kgApplicable && (
                    <Line yAxisId="kg" type="monotone" dataKey="kg" name="kg" stroke="#DB6F55" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                  )}
                  <Line yAxisId="reps" type="monotone" dataKey="reps" name="reps" stroke="#6892AB" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {chartData.some((c) => c.hasMax) && (
              <p className="text-[11px] text-ink-400 mt-1">Alcune sessioni includono ripetizioni "max" (a cedimento).</p>
            )}
          </Card>

          <Card>
            <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Storico sessioni</p>
            <ul className="divide-y divide-base-100">
              {[...filtered].reverse().map((entry, i) => (
                <li key={i} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-700 font-medium">{formatDayMonth(entry.date)}</span>
                    <span className="text-ink-400 text-xs">{entry.schedaNome}</span>
                  </div>
                  <p className="text-ink-500 text-xs mt-0.5">
                    {entry.sets.map((s, j) => (
                      <span key={j}>
                        {j > 0 && ', '}
                        {entry.kgApplicable && s.kg ? `${s.kg}kg × ` : ''}
                        {s.reps || '-'}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}
