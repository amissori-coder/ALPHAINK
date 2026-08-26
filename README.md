# AlphaInk · Controllo IVA

Webapp CFO per gestire acquisti (fatture), vendite multicanale (Sito / Amazon / eBay) e calcolo automatico dell'IVA da versare. Backend: **Firebase Auth + Firestore** (real-time, autosave, condiviso col team).

## Setup

Segui la guida passo-passo in [`SETUP.md`](./SETUP.md):

1. Crea progetto Firebase → incolla config in `firebase-config.js`
2. Abilita Auth Email/Password e crea gli utenti del team
3. Crea Firestore e applica `firestore.rules`
4. (opzionale) Deploy con `firebase deploy --only hosting`

## File

- `index.html` — SPA (Tailwind + Firebase SDK modulare)
- `firebase-config.js` — config del progetto (da compilare)
- `firestore.rules` — security rules (solo utenti autenticati)
- `SETUP.md` — guida installazione

## Uso locale rapido

```bash
python3 -m http.server 8080
# apri http://localhost:8080
```

## Funzionalità

- **Anni**: 2026 e 2027 preconfigurati, si possono aggiungere altri anni.
- **Prodotti**: solo anagrafica (nome, SKU, unità di misura). I prezzi si inseriscono su ogni fattura di acquisto e su ogni vendita.
- **Acquisti da fattura**: n° fattura, data, fornitore, prodotto, quantità, U.M., prezzo unitario senza IVA. IVA 22% automatica.
- **Vendite multicanale**: Sito / Amazon / eBay con prezzo per singola vendita.
- **Riepilogo IVA mensile**: `IVA da versare = IVA vendite − IVA acquisti`.
- **Ottimizzazione IVA**: suggerisce per ogni mese in debito l'imponibile di acquisti da fare per azzerare il versamento.
- **Autosave real-time**: ogni modifica è persistita immediatamente su Firestore e propagata al team.
