import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from './Card.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { todayKey, formatDayMonth } from '../lib/date.js'

export default function BodyMeasurements() {
  const { data, addBodyMeasurement, deleteBodyMeasurement, setMeasurementFields, uid } = useAppData()
  const [showForm, setShowForm] = useState(false)
  const [showFieldsEditor, setShowFieldsEditor] = useState(false)
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState('')
  const [measures, setMeasures] = useState({})
  const [newFieldLabel, setNewFieldLabel] = useState('')

  const sorted = data.bodyMeasurements
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  function submit(e) {
    e.preventDefault()
    if (!weight && Object.values(measures).every((v) => !v)) return
    addBodyMeasurement({
      id: uid('meas'),
      date,
      weight: weight === '' ? null : Number(weight),
      measures: Object.fromEntries(
        Object.entries(measures).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, Number(v)]),
      ),
    })
    setWeight('')
    setMeasures({})
    setShowForm(false)
  }

  function addField() {
    const label = newFieldLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/\s+/g, '-')
    if (data.measurementFields.some((f) => f.id === id)) return
    setMeasurementFields([...data.measurementFields, { id, label }])
    setNewFieldLabel('')
  }

  function removeField(id) {
    setMeasurementFields(data.measurementFields.filter((f) => f.id !== id))
  }

  const weightSeries = useMemo(
    () => sorted.filter((m) => m.weight != null).map((m) => ({ date: m.date, label: formatDayMonth(m.date), value: m.weight })),
    [sorted],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wide">Misure corporee</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowFieldsEditor((v) => !v)} className="text-xs text-ink-400 underline decoration-dotted">
            misure tracciate
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-semibold text-sage-500 bg-sage-100 rounded-full px-3 py-1"
          >
            {showForm ? 'Annulla' : '+ Aggiungi'}
          </button>
        </div>
      </div>

      {showFieldsEditor && (
        <Card>
          <p className="text-xs text-ink-400 mb-2">Scegli quali misure in cm tracciare.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.measurementFields.map((f) => (
              <span key={f.id} className="flex items-center gap-1 bg-lilac-100 text-ink-700 text-xs rounded-full px-3 py-1.5">
                {f.label}
                <button onClick={() => removeField(f.id)} className="text-ink-400 font-bold">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="es. Vita"
              className="flex-1 rounded-xl border border-base-300 px-3 py-2 text-sm"
            />
            <button onClick={addField} className="bg-lilac-200 text-ink-700 rounded-xl px-3 text-sm font-semibold">
              Aggiungi
            </button>
          </div>
        </Card>
      )}

      {showForm && (
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-ink-400">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="es. 62.5"
                className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
              />
            </div>
            {data.measurementFields.map((f) => (
              <div key={f.id}>
                <label className="text-xs text-ink-400">{f.label} (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measures[f.id] || ''}
                  onChange={(e) => setMeasures((m) => ({ ...m, [f.id]: e.target.value }))}
                  className="w-full rounded-xl border border-base-300 px-3 py-2 text-sm mt-1"
                />
              </div>
            ))}
            <button type="submit" className="w-full py-2.5 rounded-xl bg-sage-400 text-white font-semibold">
              Salva misurazione
            </button>
          </form>
        </Card>
      )}

      {first && last && first.id !== last.id && (
        <Card>
          <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Progresso totale</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {first.weight != null && last.weight != null && (
              <ProgressDiff label="Peso" unit="kg" from={first.weight} to={last.weight} />
            )}
            {data.measurementFields.map((f) => {
              const fromV = first.measures?.[f.id]
              const toV = last.measures?.[f.id]
              if (fromV == null || toV == null) return null
              return <ProgressDiff key={f.id} label={f.label} unit="cm" from={fromV} to={toV} />
            })}
          </div>
          <p className="text-[11px] text-ink-400 mt-2">
            Dal {formatDayMonth(first.date)} al {formatDayMonth(last.date)}
          </p>
        </Card>
      )}

      {weightSeries.length > 1 && (
        <Card>
          <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Andamento peso</p>
          <MiniLineChart data={weightSeries} color="#82A96E" unit="kg" />
        </Card>
      )}

      {data.measurementFields.map((f) => {
        const series = sorted
          .filter((m) => m.measures?.[f.id] != null)
          .map((m) => ({ date: m.date, label: formatDayMonth(m.date), value: m.measures[f.id] }))
        if (series.length < 2) return null
        return (
          <Card key={f.id}>
            <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Andamento {f.label.toLowerCase()}</p>
            <MiniLineChart data={series} color="#9A83B8" unit="cm" />
          </Card>
        )
      })}

      {sorted.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-ink-500 uppercase mb-2">Storico</p>
          <ul className="divide-y divide-base-100">
            {[...sorted].reverse().map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-ink-700 font-medium">{formatDayMonth(m.date)}</p>
                  <p className="text-ink-400 text-xs">
                    {m.weight != null && `${m.weight}kg `}
                    {Object.entries(m.measures || {})
                      .map(([id, v]) => {
                        const field = data.measurementFields.find((f) => f.id === id)
                        return field ? `${field.label} ${v}cm` : null
                      })
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <button onClick={() => deleteBodyMeasurement(m.id)} className="text-ink-400 text-xs">
                  elimina
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function ProgressDiff({ label, unit, from, to }) {
  const diff = to - from
  const sign = diff > 0 ? '+' : ''
  const color = diff === 0 ? 'text-ink-400' : diff < 0 ? 'text-sage-500' : 'text-coral-500'
  return (
    <div className="bg-base-50 rounded-xl p-2.5">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className={`font-display text-lg font-bold ${color}`}>
        {sign}{diff.toFixed(1)}{unit}
      </p>
    </div>
  )
}

function MiniLineChart({ data, color, unit }) {
  return (
    <div className="h-40 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9A948A' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#9A948A' }}
            axisLine={false}
            tickLine={false}
            width={32}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip
            formatter={(value) => [`${value}${unit}`, '']}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(46,43,39,0.12)', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
