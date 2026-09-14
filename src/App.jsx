import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import Summary from './components/tabs/Summary.jsx'
import Daily from './components/tabs/Daily.jsx'
import Diet from './components/tabs/Diet.jsx'
import Workout from './components/tabs/Workout.jsx'

export default function App() {
  const [tab, setTab] = useState('riepilogo')

  return (
    <div className="min-h-screen bg-base-50 font-sans">
      <main className="mx-auto max-w-md pb-24 safe-top">
        {tab === 'riepilogo' && <Summary onNavigate={setTab} />}
        {tab === 'daily' && <Daily />}
        {tab === 'dieta' && <Diet />}
        {tab === 'allenamento' && <Workout />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
