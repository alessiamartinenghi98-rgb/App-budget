// Date helpers. All "day keys" are local-time ISO date strings: YYYY-MM-DD.

export function toDateKey(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d, n) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

// Monday-start week range containing the given date. Returns [startKey, endKey].
export function weekRangeOf(date) {
  const d = new Date(date)
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  const start = addDays(d, -dow)
  const end = addDays(start, 6)
  return [toDateKey(start), toDateKey(end)]
}

export function monthRangeOf(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return [toDateKey(start), toDateKey(end)]
}

export function isDateKeyBetween(key, startKey, endKey) {
  return key >= startKey && key <= endKey
}

export function daysInMonthGrid(year, month) {
  // Returns an array of Date objects covering the full weeks (Mon-Sun) that
  // contain every day of the given month (0-indexed month).
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const firstDow = (first.getDay() + 6) % 7
  const lastDow = (last.getDay() + 6) % 7
  const gridStart = addDays(first, -firstDow)
  const gridEnd = addDays(last, 6 - lastDow)

  const days = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

export const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

export const WEEKDAY_LABELS_IT = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export function formatDayMonth(key) {
  const d = parseDateKey(key)
  return `${d.getDate()} ${MONTH_NAMES_IT[d.getMonth()]}`
}

export function formatFullDate(key) {
  const d = parseDateKey(key)
  const weekdays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  return `${weekdays[d.getDay()]} ${d.getDate()} ${MONTH_NAMES_IT[d.getMonth()]} ${d.getFullYear()}`
}

export function isSameDay(keyA, keyB) {
  return keyA === keyB
}
