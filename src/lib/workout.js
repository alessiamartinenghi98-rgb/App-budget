// Helpers for workout sessions, exercise history and program versioning.

export function normalizeName(name) {
  return name.trim().toLowerCase()
}

// All logged sets for a given exercise name, across every program/scheda/session,
// sorted oldest -> newest. Each entry: { date, sessionId, schedaNome, programNome, sets: [{reps, kg}] }
export function exerciseHistory(workoutSessions, exerciseName) {
  const target = normalizeName(exerciseName)
  const entries = []
  for (const session of workoutSessions) {
    if (!session.esercizi) continue // free-form ("libero") sessions have no exercises
    const ex = session.esercizi.find((e) => normalizeName(e.name) === target)
    if (ex) {
      entries.push({
        date: session.date,
        sessionId: session.id,
        schedaNome: session.schedaNome,
        programNome: session.programNome,
        kgApplicable: ex.kgApplicable,
        sets: ex.sets,
      })
    }
  }
  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return entries
}

// Most recent logged entry for an exercise, optionally strictly before a given date.
export function lastEntryForExercise(workoutSessions, exerciseName, beforeDate) {
  const history = exerciseHistory(workoutSessions, exerciseName)
  const filtered = beforeDate ? history.filter((h) => h.date < beforeDate) : history
  return filtered.length ? filtered[filtered.length - 1] : null
}

export function formatLastTime(entry) {
  if (!entry) return null
  const parts = entry.sets.map((s) => {
    const reps = s.reps === '' || s.reps == null ? '-' : s.reps
    if (entry.kgApplicable && s.kg != null && s.kg !== '') {
      return `${s.kg}kg × ${reps}`
    }
    return `${reps} rip.`
  })
  return parts.join(', ')
}

export function sessionVolume(session) {
  if (!session.esercizi) return null
  let total = 0
  let hasNumeric = false
  for (const ex of session.esercizi) {
    for (const set of ex.sets) {
      const reps = Number(set.reps)
      const kg = Number(set.kg)
      if (Number.isFinite(reps) && Number.isFinite(kg) && kg > 0) {
        total += reps * kg
        hasNumeric = true
      }
    }
  }
  return hasNumeric ? total : null
}

export function exerciseVolume(exercise) {
  let total = 0
  let hasNumeric = false
  for (const set of exercise.sets) {
    const reps = Number(set.reps)
    const kg = Number(set.kg)
    if (Number.isFinite(reps) && Number.isFinite(kg) && kg > 0) {
      total += reps * kg
      hasNumeric = true
    }
  }
  return hasNumeric ? total : null
}

// Distinct exercise names across all programs (for progression browsing), in
// first-seen order across program start dates.
export function allExerciseNames(programs) {
  const seen = new Map()
  const sorted = [...programs].sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
  for (const program of sorted) {
    for (const scheda of program.schede) {
      for (const ex of scheda.esercizi) {
        const key = normalizeName(ex.name)
        if (!seen.has(key)) seen.set(key, ex.name)
      }
    }
  }
  return [...seen.values()]
}

// Average kg and average numeric reps across the sets of one logged entry —
// a single summary point per session so kg and reps can be charted together.
export function summarizeEntry(entry) {
  const kgs = entry.sets.map((s) => Number(s.kg)).filter((n) => Number.isFinite(n) && n > 0)
  const reps = entry.sets.map((s) => Number(s.reps)).filter((n) => Number.isFinite(n) && n > 0)
  const hasMax = entry.sets.some((s) => typeof s.reps === 'string' && s.reps.trim().toLowerCase() === 'max')
  return {
    avgKg: kgs.length ? Number((kgs.reduce((a, b) => a + b, 0) / kgs.length).toFixed(1)) : null,
    avgReps: reps.length ? Number((reps.reduce((a, b) => a + b, 0) / reps.length).toFixed(1)) : null,
    hasMax,
  }
}

export function findScheda(programs, schedaId) {
  for (const program of programs) {
    const scheda = program.schede.find((s) => s.id === schedaId)
    if (scheda) return { program, scheda }
  }
  return null
}
