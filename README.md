# AlphaInk

Strumento CFO per controllo IVA e cashflow. Pensato per capire ogni mese il saldo IVA e
ricevere un suggerimento operativo sugli acquisti da effettuare nello stesso periodo per
evitare (o ridurre) il versamento all'erario.

## Principi

- **I prezzi non stanno nei prodotti**: l'anagrafica contiene solo codice, nome, unità di
  misura e aliquota IVA di riferimento. I prezzi — sia di vendita sia di acquisto — si
  inseriscono riga per riga dentro **ogni fattura** o **acquisto**.
- **Autosalvataggio**: ogni modifica viene persistita automaticamente in `localStorage` con
  debounce di 400 ms, flush sincrono su chiusura/sospensione della finestra e backup
  automatico della versione precedente. Niente dati persi se l'utente chiude l'applicazione.
- **Dashboard IVA**: KPI del mese, andamento a 6 mesi, riepilogo per periodo e
  suggerimento automatico sull'imponibile di acquisti da registrare per pareggiare il saldo.
- **Import/Export JSON**: backup e ripristino completi del dataset.

## Sviluppo

```bash
npm install
npm run dev
```

Build di produzione:

```bash
npm run build
npm run preview
```

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS con palette "ink / accent" (professionale, monospace per le cifre)
- Persistenza locale con autosalvataggio e backup
