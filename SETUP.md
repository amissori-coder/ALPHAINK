# AlphaInk · Setup Firebase

Guida passo-passo per mettere online la webapp di controllo IVA.

## 1. Crea il progetto Firebase

1. Vai su https://console.firebase.google.com/ e clicca **Aggiungi progetto**.
2. Nome suggerito: `alphaink`. Google Analytics opzionale.
3. Attendi la creazione.

## 2. Registra la Web App

1. Nella dashboard del progetto clicca l'icona **`</>`** (Web).
2. Nickname app: `alphaink-web`.
3. **Spunta** "Configura anche Firebase Hosting" se vuoi pubblicarla subito.
4. Copia l'oggetto `firebaseConfig` che ti viene mostrato.
5. Incolla i valori in `firebase-config.js` al posto dei `REPLACE_...`.

## 3. Attiva Authentication (Email/Password)

1. Menu laterale → **Build → Authentication → Get started**.
2. Tab **Sign-in method** → abilita **Email/Password**.
3. Tab **Users** → **Add user** → crea gli account del team (es. `cfo@alphaink.it`).
4. Per chiudere le registrazioni esterne: **Settings → User actions** → disattiva "Enable create (sign-up)" quando hai finito di creare gli utenti interni.

## 4. Crea il database Firestore

1. Menu laterale → **Build → Firestore Database → Create database**.
2. Scegli **Production mode**.
3. Location: `eur3 (europe-west)` (o la region più vicina).

## 5. Applica le Security Rules

1. Firestore Database → tab **Rules**.
2. Copia il contenuto di `firestore.rules` di questo repo e incolla.
3. **Publish**.

## 6. (Opzionale) Deploy su Firebase Hosting

Installa la CLI: `npm install -g firebase-tools`

```bash
firebase login
firebase init hosting
# - Usa il progetto "alphaink"
# - Public directory: .
# - Single-page app: No
# - Non sovrascrivere index.html
firebase deploy --only hosting
```

La webapp sarà su `https://<project-id>.web.app`.

## 7. Uso in locale

I moduli ES non funzionano via `file://`. Avvia un server statico:

```bash
# Python 3
python3 -m http.server 8080
# oppure Node
npx serve .
```

Poi apri http://localhost:8080.

## Struttura dati Firestore

| Collection | Campi principali |
|---|---|
| `products` | `name`, `sku`, `unit` |
| `purchases` | `year`, `month`, `invoiceNumber`, `invoiceDate`, `supplier`, `productId`, `productName`, `qty`, `unit`, `unitPriceNoVat`, `imponibile`, `iva`, `totale` |
| `sales` | `year`, `month`, `channel` (`sito`/`amazon`/`ebay`), `productId`, `productName`, `qty`, `unit`, `unitPriceNoVat`, `imponibile`, `iva`, `totale` |
| `meta/config` | `years: [2026, 2027, ...]` |

IVA calcolata al 22% su ogni riga. Il riepilogo mensile fa `IVA da versare = IVA vendite − IVA acquisti`. La sezione **Ottimizzazione IVA** suggerisce, per ogni mese in debito, l'imponibile di acquisti da fare per azzerare il versamento.
