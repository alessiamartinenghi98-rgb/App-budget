import { isDateKeyBetween, weekRangeOf, monthRangeOf, toDateKey } from './date.js'

export function countWorkoutsInRange(workoutSessions, startKey, endKey) {
  const days = new Set()
  for (const s of workoutSessions) {
    if (isDateKeyBetween(s.date, startKey, endKey)) days.add(s.date)
  }
  return days.size
}

export function countDietInRange(diet, startKey, endKey) {
  let ok = 0
  let sgarri = 0
  for (const [key, entry] of Object.entries(diet)) {
    if (!isDateKeyBetween(key, startKey, endKey)) continue
    if (entry.status === 'ok') ok += 1
    else if (entry.status === 'sgarro') sgarri += 1
  }
  return { ok, sgarri }
}

export function rangesForToday() {
  const now = new Date()
  const [weekStart, weekEnd] = weekRangeOf(now)
  const [monthStart, monthEnd] = monthRangeOf(now)
  return { weekStart, weekEnd: toDateKey(now) < weekEnd ? toDateKey(now) : weekEnd, weekEndFull: weekEnd, monthStart, monthEnd, today: toDateKey(now) }
}

export function waterGoalMetOn(water, waterGoalMl, dateKey) {
  return (water[dateKey] || 0) >= waterGoalMl
}

// Consecutive "clean" diet days ending today (or yesterday, so a not-yet-logged
// today doesn't zero out an ongoing streak).
export function cleanDietStreak(diet, todayKeyStr) {
  const day = new Date(
    Number(todayKeyStr.slice(0, 4)),
    Number(todayKeyStr.slice(5, 7)) - 1,
    Number(todayKeyStr.slice(8, 10)),
  )
  let streak = 0
  let cursor = new Date(day)

  const keyOf = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  // If today has no entry yet, start counting from yesterday.
  if (!diet[keyOf(cursor)]) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (diet[keyOf(cursor)]?.status === 'ok') {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
