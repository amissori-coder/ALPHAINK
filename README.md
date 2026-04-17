# ALPHAINK

Web app per la gestione di prodotti, acquisti con fattura, vendite multicanale (Sito / Amazon / eBay) e calcolo automatico dell'IVA (22%) con determinazione dell'IVA da versare.

## Come si usa

Aprire `index.html` direttamente nel browser (doppio clic o tramite file://...). Nessuna installazione, nessun backend.

I dati sono salvati nel `localStorage` del browser. Puoi esportare/importare un backup JSON in qualsiasi momento dall'header.

## Funzionalità

- **Anni**: 2026 e 2027 preconfigurati, possibilità di aggiungere altri anni (es. 2028, 2029, ...).
- **Prodotti**: nome, SKU, unità di misura, tre prezzi distinti (Sito, Amazon, eBay) senza IVA.
- **Acquisti**: per ogni mese si registrano le righe di fattura con numero, data, fornitore, prodotto, quantità, unità di misura e prezzo unitario senza IVA. IVA 22% calcolata automaticamente.
- **Vendite**: per ogni mese e per ciascun canale (Sito / Amazon / eBay) si indicano quantità, unità di misura e prezzo unitario senza IVA (precompilato dal listino del prodotto sul canale scelto).
- **Riepilogo IVA**: tabella mensile con imponibile e IVA di acquisti e vendite; l'**IVA da versare** è calcolata come differenza tra IVA sulle vendite e IVA sugli acquisti, per ogni mese e per l'anno.

## Struttura dati (localStorage chiave `alphaink_data_v1`)

```
{
  "years": [2026, 2027],
  "products":  { "2026": [ { id, name, sku, unit, prices: { sito, amazon, ebay } } ] },
  "purchases": { "2026": [ { id, month, invoiceNum, invoiceDate, supplier, productId, productName, unit, qty, unitPrice } ] },
  "sales":     { "2026": [ { id, month, channel, productId, productName, unit, qty, unitPrice } ] }
}
```
