# 📦 Simple Inventory Enhanced Card

Un'interfaccia grafica avanzata, modulare e multilingua per **Home Assistant**, progettata per estendere ed elevare l'esperienza d'uso dell'integrazione personalizzata **Simple Inventory**. Questa card trasforma la gestione della dispensa in un sistema professionale di tracciamento scorte, scadenze e automazione delle liste della spesa.

---

## 📌 Indice dei Contenuti
1. [✨ Funzionalità Principali](#-funzionalità-principali)
2. [⚙️ Editor Visuale e Personalizzazione della Plancia](#️-editor-visuale-e-personalizzazione-della-plancia)
3. [🚀 Sviluppi e Implementazioni Future (Roadmap)](#-sviluppi-e-implementazioni-future-roadmap)
4. [🛠️ Tecnologie Utilizzate](#️-tecnologie-utilizzate)
5. [🔐 Requisiti di Sicurezza e Impostazioni della Fotocamera](#-requisiti-di-sicurezza-e-impostazioni-della-fotocamera)
6. [📥 Guida all'Installazione tramite HACS](#-guida-allinstallazione-tramite-hacs)
7. [⚙️ Configurazione Lovelace (YAML di esempio)](#️-configurazione-lovelace-yaml-di-esempio)
8. [📄 Licenza](#-licenza)

---

## ✨ Funzionalità Principali

* **🎨 Grafica Pastello Intelligente:** Cambia colore di sfondo in base alle allerte (scadenze imminenti, prodotti già scaduti, scorte critiche o esaurite) con trasparenze HEX avanzate configurabili direttamente dall'editor Lovelace.
* **🛒 Scanner di Codici a Barre Locale:** Integrazione nativa della fotocamera su dispositivi mobili Android per rilevare all'istante i codici EAN dei prodotti al supermercato o in casa.
* **📡 Integrazione Smart Open Food Facts:** Se inquadri un... prodotto inedito, la card interroga in tempo reale l'API mondiale recuperando istantaneamente Nome Prodotto, Categoria e Confezione netta (es. *500 Grammi*, *1 Litro*) precompilando il form.
* **🔄 Riconoscimento Duplicati Automatico:** Se scansioni un codice a barre già presente in inventario, il sistema salta la creazione e ti apre direttamente il form di modifica per aggiornare le scorte.
* **📋 Integrazione To-Do List di HA:** Un menu a tendina dinamico interroga Home Assistant per farti scegliere direttamente una delle tue liste To-Do reali (es. *todo.grocery_list*) a cui agganciare la soglia di riordino automatica.
* **🌍 Internazionalizzazione (i18n):** Supporto nativo speculare al 100% per 5 lingue: Italiano, Inglese, Francese, Tedesco e Spagnolo.
* **📱 Layout Responsive & Griglia Rigida Android:** Progettato specificamente per non andare mai a capo sugli schermi stretti degli smartphone, eliminando i bug grafici dello Shadow DOM su Android.

---

## ⚙️ Editor Visuale e Personalizzazione della Plancia

Tutte le preferenze della card possono essere gestite ed estese comodamente tramite l'**Editor Visuale Interattivo** integrato in Lovelace, senza la necessità di scrivere codice YAML a mano:

* **📐 Griglia e Colonne Dinamiche:** È possibile personalizzare il numero di colonne per adattare la visualizzazione della griglia dei prodotti a qualsiasi tipo di schermo (PC, Tablet o Smartphone).
* **📥 Import & Export:** La card integra funzioni avanzate per esportare l'intero database della dispensa in formato testuale o importare stock massivi di prodotti in pochissimi secondi.
* **🔌 Disattivazione Selettiva dei Componenti:** Attraverso i comodi interruttori (toggle) grafici dell'editor, puoi nascondere o mostrare singolarmente le varie aree della card per ripulire l'interfaccia:
    * Sezione Icone di Riepilogo (Contatori totali, prodotti scaduti, in esaurimento, ecc.).
    * Barra di ricerca (Filtro istantaneo e inserimento rapido tramite scanner barcode).
    * Cambia Ordinamento (Menu a tendina dei criteri di tri e categorie dinamiche).
    * Elenco dei prodotti (La griglia principale con le tessere degli articoli).
    * Inserimento prodotto (La visibilità del tasto "Aggiungi" in alto a destra).

---

## 🚀 Sviluppi e Implementazioni Future (Roadmap)

Le prossime versioni della card si concentreranno sull'ottimizzazione delle performance, su nuove scorciatoie interattive e su una migliore disposizione degli elementi:

* ⚡ **Ottimizzazione Editor:** Ottimizzare lo script di configurazione per rendere molto più veloce e reattivo il caricamento iniziale dell'editor visuale Lovelace.
* 📦 **Pubblicazione ufficiale su HACS:** Registrare la card come archivio ufficiale nel catalogo pubblico di HACS per consentire l'installazione automatica senza inserire l'URL.
* 🔗 **Scorciatoia Liste To-Do:** Introdurre la possibilità di cliccare direttamente sull'icona della lista della spesa associata a un prodotto per aprire istantaneamente la relativa lista di Home Assistant in un popup.
* 🔔 **Logica Giorni di Preavviso:** Sviluppare un sistema che sfrutti attivamente i "giorni di preavviso" impostati, in modo da far attivare l'allerta di scadenza (sfondo giallo/arancione della tessera) esattamente al raggiungimento della soglia personalizzata di giorni inserita dall'utente, anziché basarsi su intervalli fissi a 10 o 30 giorni.
* 📐 **Restyling Interfaccia Import/Export:** Riposizionare i tasti di Import ed Export in una zona più strategica, discreta e visivamente integrata nel layout della card.

---

## 🛠️ Tecnologie Utilizzate

1. **Backend Core:** Simple Inventory Python Integration (componente personalizzato per Home Assistant).
2. **Motore di Scansione:** Html5-QRCode (libreria JavaScript locale integrata *on-demand* per la decodifica dei formati EAN-13, EAN-8 e Code-128).
3. **Database Informazioni:** Open Food Facts API v3 (servizio open-source per l'estrazione delle schede tecniche dei prodotti).

---

## 🔐 Requisiti di Sicurezza e Impostazioni della Fotocamera

A causa delle rigide politiche di privacy e sandbox dei browser moderni (Google Chrome, Android WebView, ecc.), **la fotocamera si attiverà solo se viene garantito un contesto sicuro**.

### 1. Connessione Sicura (Consigliata)
Accedi a Home Assistant utilizzando un URL protetto crittografato **`https://`** (es. tramite *Nabu Casa Cloud*, *DuckDNS Let's Encrypt* o proxy SSL inverso).

### 2. Sblocco via IP Locale (Bypass per connessioni `http://`)
Se accedi a Home Assistant solo tramite indirizzo IP interno (es. `http://1.xx`), devi forzare il browser a considerare sicuro quell'indirizzo:
1. Apri **Google Chrome** sul dispositivo Android o PC.
2. Digita nella barra degli indirizzi: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Imposta la voce su **`Enabled`**.
4. Inserisci l'URL del tuo Home Assistant nella casella di testo (es. `http://1.xx`).
5. Clicca su **`Relaunch`** in basso a destra per riavviare Chrome.

### 3. Permessi Android
Assicurati che l'applicazione ufficiale di Home Assistant (o Google Chrome su mobile) possieda l'autorizzazione hardware per l'utilizzo della fotocamera nelle impostazioni di sistema di Android (*Impostazioni ➡️ Applicazioni ➡️ Home Assistant ➡️ Permessi ➡️ Fotocamera ➡️ Consenti*).

---

## 📥 Guida all'Installazione tramite HACS

Grazie alla predisposizione del repository, l'installazione e la gestione degli aggiornamenti futuri avvengono in modo completamente automatico tramite **HACS (Home Assistant Community Store)**.

### 1. Aggiungere il Repository Personalizzato
1. Apri Home Assistant e clicca sulla voce **HACS** nel menu laterale.
2. Clicca sui **tre puntini** in alto a destra e seleziona **Repository personalizzati** (*Custom Repositories*).
3. Incolla l'URL del tuo repository GitHub nella casella di testo:
   `https://github.com`
4. Sotto la voce **Categoria**, seleziona **Plugin** (o *Lovelace*).
5. Clicca sul pulsante **Aggiungi**.

### 2. Scaricare e Registrare il Modulo
1. La card apparirà immediatamente nell'elenco di HACS sotto la voce "Nuovi repository".
2. Clicca sulla card e premi **Scarica** (*Download*) in basso a destra, selezionando l'ultima versione disponibile.
3. HACS scaricherà automaticamente tutti i file del progetto (compresa la cartella dei moduli di rendering, delle lingue e la libreria del codice a barre locale) posizionandoli nella directory corretta `/config/www/community/simple-inventory-enhanced-card/`.
4. Al termine del download, se richiesto, clicca su **Ricarica il browser** (*Reload*) per aggiornare la cache grafica di Home Assistant.

---

## ⚙️ Configurazione Lovelace (YAML di esempio)

Anche se è consigliabile configurarla graficamente tramite l'interfaccia visiva dell'Editor, ecco un esempio di configurazione testuale YAML memorizzato dalla plancia:

```yaml
type: custom:simple-inventory-enhanced-card
entity: sensor.simple_inventory_dispensa # La tua entità generata dal backend Python
columns: 2
show_search: true
show_sort: true
show_summary: true
show_items: true
show_add_form: true
color_expired: "#db4437"
alpha_expired: 20
color_10d: "#e6a23c"
alpha_10d: 15
color_qty0: "#db4437"
alpha_qty0: 30
```

---
## 📄 Licenza
Il progetto è rilasciato sotto licenza MIT. Open Food Facts è un database aperto regolato da licenza ODbl.
