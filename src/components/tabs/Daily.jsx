import { useState } from 'react'
import Card from '../Card.jsx'
import Calendar from '../Calendar.jsx'
import DayDetailModal from '../DayDetailModal.jsx'
import BodyMeasurements from '../BodyMeasurements.jsx'
import { useAppData } from '../../context/AppDataContext.jsx'

export default function Daily() {
  const { data } = useAppData()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedKey, setSelectedKey] = useState(null)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  return (
    <div className="px-4 pt-6 space-y-4 animate-fadeUp">
      <header className="mb-2">
        <h1 className="font-display text-3xl font-bold text-ink-900">Daily</h1>
      </header>

      <Card>
        <Calendar
          year={year}
          month={month}
          data={data}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onSelectDay={setSelectedKey}
          selectedKey={selectedKey}
        />
      </Card>

      <BodyMeasurements />

      {selectedKey && <DayDetailModal dateKey={selectedKey} onClose={() => setSelectedKey(null)} />}
    </div>
  )
}
