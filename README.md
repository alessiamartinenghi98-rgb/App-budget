# Le Mie Spese

App web semplice per tenere traccia delle spese personali, pensata per l'uso da smartphone.

## Funzionalità

- Aggiungi una spesa con importo, categoria (Cibo, Trasporti, Casa, Svago, Altro), data e nota facoltativa
- Elenco delle spese, ordinato dalla più recente
- Riepilogo con totale per categoria (filtrabile per mese) e totale per mese
- Dati salvati in locale nel browser (`localStorage`), nessun server richiesto

## Come usarla

Basta aprire `index.html` in un browser, oppure servire la cartella con un server statico qualsiasi, ad esempio:

```bash
python3 -m http.server 8000
```

e visitare `http://localhost:8000`.

## Struttura del progetto

```
index.html      pagina principale
css/style.css   stile dell'app
js/app.js       logica dell'app (gestione spese, riepiloghi, localStorage)
```
