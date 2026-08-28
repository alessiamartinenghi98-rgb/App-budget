# Le Mie Spese 💕

App web per tenere traccia delle spese personali e dei budget mensili, con uno stile pastello pensata per l'uso quotidiano da smartphone.

## Funzionalità

- **Ciclo mensile dal 27**: ogni "mese" va dal 27 al 26 successivo (giorno dello stipendio), non dal 1°.
- **Saldo iniziale persistente**: lo imposti una volta a inizio ciclo e resta salvato, modificabile in qualsiasi momento.
- **Tre numeri sempre visibili in home**, in un'unica riga compatta: saldo iniziale, saldo attuale stimato (saldo iniziale − spese del ciclo) e quanto hai risparmiato finora (saldo iniziale − spese − budget non ancora usato nelle altre categorie).
- **Obiettivo di risparmio mensile di 600 €** (500 € viaggio + 100 € da accantonare), con barra di progresso, importo mancante e percentuale.
- **8 categorie**, 7 con budget mensile: Bar e Cene/Pranzi (250 €, con sotto-voci Bar/Cene-Pranzi), Bellezza (100 €, con sotto-voci Trucchi/Vestiti/Skincare/Capelli), Affitto (390 €), Bollette (40 €), Spesa (130 €), Dentista (86 €), Benzina (250 €) — più **Altro**, senza budget, per tutto quello che non rientra nelle altre.
- **Barre di avanzamento pastello per categoria**, con importo, percentuale e avviso quando ci si avvicina o si supera il budget.
- **Ritmo settimanale per Bar e Cene/Pranzi, Spesa e Benzina**: quanto speso questa settimana rispetto al budget settimanale (budget mensile ÷ 4), visibile sia in home che nella scheda Budget, con indicazione se sei in linea o sopra il ritmo. Bollette e Bellezza restano solo mensili.
- **Elenco spese** con animazione leggera quando ne aggiungi una nuova.
- **Dati salvati in locale nel browser** (`localStorage`): spese e saldo iniziale non si perdono riaprendo l'app, nessun server o account richiesto.

## Come usarla

Basta aprire `index.html` in un browser, oppure servire la cartella con un server statico qualsiasi, ad esempio:

```bash
python3 -m http.server 8000
```

e visitare `http://localhost:8000`. Per usarla dal telefono, apri lo stesso indirizzo sostituendo `localhost` con l'IP del computer sulla stessa rete Wi-Fi.

## Struttura del progetto

```
index.html      pagina principale (Home, Spese, Budget)
css/style.css   stile pastello dell'app
js/app.js       logica dell'app (cicli mensili, budget, sotto-categorie, localStorage)
```

## Personalizzare categorie e budget

Le categorie, le sotto-voci, i budget e l'obiettivo di risparmio sono definiti all'inizio di `js/app.js` (`CATEGORIES` e `SAVINGS_GOAL`): basta modificare quei valori per adattarli.
