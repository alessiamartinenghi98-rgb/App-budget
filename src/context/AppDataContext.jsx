import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loadAppData, saveAppData, uid } from '../lib/storage.js'
import { todayKey } from '../lib/date.js'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => loadAppData())

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const update = useCallback((updater) => {
    setData((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  // ---- Water ----
  const setWaterGoal = useCallback((ml) => {
    update((prev) => ({ ...prev, waterGoalMl: ml }))
  }, [update])

  const addWater = useCallback((ml, dateKey = todayKey()) => {
    update((prev) => {
      const current = prev.water[dateKey] || 0
      const next = Math.max(0, current + ml)
      return { ...prev, water: { ...prev.water, [dateKey]: next } }
    })
  }, [update])

  const setWaterForDay = useCallback((dateKey, ml) => {
    update((prev) => ({ ...prev, water: { ...prev.water, [dateKey]: Math.max(0, ml) } }))
  }, [update])

  // ---- Diet ----
  const setDietDay = useCallback((dateKey, entry) => {
    update((prev) => ({ ...prev, diet: { ...prev.diet, [dateKey]: { ...prev.diet[dateKey], ...entry } } }))
  }, [update])

  // ---- Workout goal ----
  const setWorkoutGoalWeekly = useCallback((n) => {
    update((prev) => ({ ...prev, workoutGoalWeekly: n }))
  }, [update])

  // ---- Workout sessions ----
  const saveWorkoutSession = useCallback((session) => {
    update((prev) => {
      const existingIdx = prev.workoutSessions.findIndex((s) => s.id === session.id)
      const sessions = [...prev.workoutSessions]
      if (existingIdx >= 0) {
        sessions[existingIdx] = session
      } else {
        sessions.push(session)
      }
      return { ...prev, workoutSessions: sessions }
    })
  }, [update])

  const deleteWorkoutSession = useCallback((sessionId) => {
    update((prev) => ({ ...prev, workoutSessions: prev.workoutSessions.filter((s) => s.id !== sessionId) }))
  }, [update])

  // ---- Programs / schede ----
  const setActiveProgramId = useCallback((id) => {
    update((prev) => ({ ...prev, activeProgramId: id }))
  }, [update])

  const addProgram = useCallback((program) => {
    update((prev) => ({
      ...prev,
      programs: [...prev.programs, program],
      activeProgramId: program.id,
    }))
  }, [update])

  const updateProgram = useCallback((programId, updater) => {
    update((prev) => ({
      ...prev,
      programs: prev.programs.map((p) => (p.id === programId ? updater(p) : p)),
    }))
  }, [update])

  // ---- Body measurements ----
  const addBodyMeasurement = useCallback((measurement) => {
    update((prev) => ({
      ...prev,
      bodyMeasurements: [...prev.bodyMeasurements, measurement].sort((a, b) => (a.date < b.date ? -1 : 1)),
    }))
  }, [update])

  const updateBodyMeasurement = useCallback((id, patch) => {
    update((prev) => ({
      ...prev,
      bodyMeasurements: prev.bodyMeasurements
        .map((m) => (m.id === id ? { ...m, ...patch } : m))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    }))
  }, [update])

  const deleteBodyMeasurement = useCallback((id) => {
    update((prev) => ({ ...prev, bodyMeasurements: prev.bodyMeasurements.filter((m) => m.id !== id) }))
  }, [update])

  const setMeasurementFields = useCallback((fields) => {
    update((prev) => ({ ...prev, measurementFields: fields }))
  }, [update])

  const value = {
    data,
    uid,
    setWaterGoal,
    addWater,
    setWaterForDay,
    setDietDay,
    setWorkoutGoalWeekly,
    saveWorkoutSession,
    deleteWorkoutSession,
    setActiveProgramId,
    addProgram,
    updateProgram,
    addBodyMeasurement,
    updateBodyMeasurement,
    deleteBodyMeasurement,
    setMeasurementFields,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
