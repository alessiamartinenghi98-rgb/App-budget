import { createDefaultAppData } from './defaultData.js'

const STORAGE_KEY = 'fittrack.data.v1'

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultAppData()
    const parsed = JSON.parse(raw)
    // Shallow-merge with defaults so newly-added fields don't break old saves.
    return { ...createDefaultAppData(), ...parsed }
  } catch (err) {
    console.error('Impossibile leggere i dati salvati, riparto da zero.', err)
    return createDefaultAppData()
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Impossibile salvare i dati.', err)
  }
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
