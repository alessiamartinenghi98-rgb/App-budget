import { todayKey } from './date.js'

// "max" reps type: field accepts either a number or free text like "max".
export function makeExercise(name, sets, reps, opts = {}) {
  return {
    name,
    defaultSets: sets,
    defaultReps: reps, // number or string ("max")
    kgApplicable: opts.kgApplicable !== false,
  }
}

export const DEFAULT_SCHEDE = [
  {
    id: 'scheda-a',
    nome: 'Scheda A',
    esercizi: [
      makeExercise('Hip thrust', 3, 6),
      makeExercise('Stacchi rumeni al multipower', 3, 10),
      makeExercise('Step up', 3, 10),
      makeExercise('Kickback con extrarotazione', 3, 8),
    ],
  },
  {
    id: 'scheda-b',
    nome: 'Scheda B',
    esercizi: [
      makeExercise('Rematore singolo al cavo', 3, 8),
      makeExercise('Shoulder press machine', 4, 8),
      makeExercise('Push down singolo', 3, 8),
      makeExercise('Push down corda', 3, 10),
      makeExercise('Curl ai cavi alti', 4, 10),
      makeExercise('Leg raise alla sbarra', 3, 'max', { kgApplicable: false }),
    ],
  },
  {
    id: 'scheda-c',
    nome: 'Scheda C',
    esercizi: [
      makeExercise('Stacchi rumeni b-stance', 3, 6),
      makeExercise('Lat machine con triangolo', 4, 6),
      makeExercise('Triceps press cavo alto', 4, 10),
      makeExercise('Clamshell', 3, 'max', { kgApplicable: false }),
    ],
  },
  {
    id: 'scheda-d',
    nome: 'Scheda D',
    esercizi: [
      makeExercise('Affondi bulgari', 3, 6),
      makeExercise('Kickback al cavo', 3, 10),
      makeExercise('Lat machine prona', 4, 6),
      makeExercise('Curl con bilanciere EZ', 4, 6),
      makeExercise('Calf singolo in piedi', 3, 'max', { kgApplicable: false }),
    ],
  },
]

export function createDefaultAppData() {
  return {
    version: 1,
    waterGoalMl: 2000,
    workoutGoalWeekly: 4,
    water: {}, // { [dateKey]: totalMl }
    diet: {}, // { [dateKey]: { status, sgarroLevel, sgarroNote, mealLog } }
    programs: [
      {
        id: 'programma-1',
        nome: 'Programma 1',
        startDate: todayKey(),
        durationWeeks: 6,
        schede: DEFAULT_SCHEDE,
      },
    ],
    activeProgramId: 'programma-1',
    workoutSessions: [], // { id, date, programId, programNome, schedaId, schedaNome, esercizi: [{name, kgApplicable, sets:[{reps, kg}]}] }
    bodyMeasurements: [], // { id, date, weight, measures: { [fieldId]: value } }
    measurementFields: [
      { id: 'vita', label: 'Vita' },
      { id: 'fianchi', label: 'Fianchi' },
      { id: 'cosce', label: 'Cosce' },
      { id: 'braccia', label: 'Braccia' },
    ],
  }
}
