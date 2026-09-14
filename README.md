# FitTrack — Allenamento & Dieta

PWA personale, offline-first, per monitorare allenamento, dieta, acqua e misure corporee. Nessun login, nessun backend: tutti i dati restano nel browser (`localStorage`).

## Stack

- React + Vite
- Tailwind CSS
- Recharts per i grafici
- `vite-plugin-pwa` per manifest e service worker (installabile su iPhone)

## Deploy

L'app è pubblicata su Vercel a partire da questo branch (`claude/pwa-workout-diet-tracker-w3x0z0`).

## Sviluppo

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato dal terminale. Per usarla dal telefono sulla stessa rete Wi-Fi, avvia con `npm run dev -- --host` e apri `http://<ip-del-computer>:5173` da Safari.

## Build di produzione

```bash
npm run build
npm run preview
```

## Installazione su iPhone

1. Apri l'app da Safari (in locale sulla stessa rete, oppure dopo il deploy su un servizio come Vercel/Netlify).
2. Tocca "Condividi" → "Aggiungi a Home".
3. Da quel momento l'app funziona anche offline: allenamenti, dieta, acqua e misure sono salvati solo sul telefono.

## Struttura

```
src/
  components/
    tabs/            Riepilogo, Daily, Dieta, Allenamento
    workout/          Log allenamento, progressione esercizi, gestione schede/programmi
    Calendar.jsx       Calendario mensile con anelli stile Apple Watch
    DayDetailModal.jsx Dettaglio di un giorno
    BodyMeasurements.jsx Peso e misure in cm, con grafici
    ActivityRing.jsx  Anello concentrico riutilizzabile
  context/
    AppDataContext.jsx Stato dell'app + persistenza in localStorage
  lib/
    date.js, stats.js, workout.js, defaultData.js, storage.js
```

Il modello dati collega ogni giorno (chiave `YYYY-MM-DD`) a dieta, acqua e sessione di allenamento, così Riepilogo e Daily leggono le stesse informazioni senza duplicazioni. Le schede di allenamento sono raggruppate in "programmi" (cicli di 6 settimane): i programmi precedenti restano consultabili, e la progressione di un esercizio viene calcolata cercandolo per nome in tutti i programmi/schede/sessioni salvati.

## Personalizzare

- Le schede di partenza (A/B/C/D) sono in `src/lib/defaultData.js`.
- Le misure corporee tracciate (oltre al peso) si aggiungono/rimuovono direttamente dall'app, nel tab Daily → "misure tracciate".
- Obiettivo acqua e obiettivo allenamenti settimanali si modificano dalle rispettive card in Riepilogo/Allenamento.
