# 📦 Simple Inventory Enhanced Card

[![hacs_badge](https://shields.io)](https://github.com)
[![License: MIT](https://shields.io)](https://opensource.org)

🌐 **Select Language:**  
*   [English Version 🇬🇧](#-english-version)
*   [Versione Italiana 🇮🇹](#-versione-italiana)

---

# 🇬🇧 English Version

An advanced, modular, and multilingual frontend card for **Home Assistant**, designed to extend and elevate the user experience of the **Simple Inventory** custom integration. This card transforms pantry management into a professional tracking system for stocks, expiries, and automatic grocery list generation.

## 📌 Table of Contents
1. [✨ Main Features](#-main-features)
2. [⚙️ Visual Editor & Dashboard Customization](#️-visual-editor--dashboard-customization)
3. [🚀 Future Roadmap](#-future-roadmap)
4. [🛠️ Technologies Used](#️-technologies-used)
5. [🔐 Security Requirements & Camera Settings](#-security-requirements--camera-settings)
6. [📥 HACS Installation Guide](#-hacs-installation-guide)
7. [⚙️ Lovelace Configuration (Example)](#️-lovelace-configuration-example)

### ✨ Main Features
* **🎨 Smart Pastel Graphics:** Dynamically changes card background colors based on alerts (imminent expiries, already expired products, critical or out-of-stock items) using advanced HEX transparency settings.
* **🛒 Local Barcode Scanner:** Native camera integration optimized for Android mobile devices to instantly scan EAN barcodes on products.
* **📡 Smart Open Food Facts Integration:** When scanning a new item, the card queries the public worldwide database in real time, automatically fetching the Item Name, Category, and Net Packaging (e.g., *500 Grams*, *1 Liter*) to pre-fill the form.
* **🔄 Automatic Duplicate Detection:** If you scan a barcode that already exists in your catalog, the system bypasses creation and immediately opens the Edit Form to let you update current stocks.
* **📋 HA To-Do List Integration:** A dynamic dropdown menu queries Home Assistant, allowing you to link your items directly to real To-Do entities (e.g., *todo.grocery_list*) combined with an automatic reorder threshold.
* **🌍 Internationalization (i18n):** 100% full specular support for 5 native languages: Italian, English, French, German, and Spanish.
* **📱 Responsive Layout & Android Fixed Grid:** Designed to prevent layout breaking or text wrapping on narrow smartphone screens, bypassing Shadow DOM styling bugs on Android.

### ⚙️ Visual Editor & Dashboard Customization
All configuration properties can be managed directly via the **Lovelace Interactive Visual Editor**, with no manual YAML coding needed:
* **📐 Dynamic Grid & Columns:** Customize the number of grid columns to optimize product display on any screen size (PC, Tablet, or Smartphone).
* **📥 Import & Export:** Built-in actions to quickly export your entire pantry database into a portable text layout or batch-import massive product stocks.
* **🔌 Selective Component Hiding:** Use visual toggles in the editor to individually show or hide different card elements:
    * Summary Icons Section (Total item counters, expired, low stock, etc.).
    * Search Bar (Instant typing filter and quick camera scanner trigger).
    * Sorting Dropdown (Menu for sorting criteria and dynamic category filters).
    * Product Grid (The main panel displaying item cards).
    * Product Input (Toggles the visibility of the top-right "Add Product" button).

### 🚀 Future Roadmap
* ⚡ **Editor Optimization:** Refactor configuration scripts to dramatically increase the initial rendering speed of the visual editor.
* 📦 **HACS Default Catalog:** Register the card as an official default archive in HACS for single-click installation without adding custom URLs.
* 🔗 **To-Do List Shortcut:** Add the ability to click on the shopping list icon of an item card to instantly open the related Home Assistant To-Do list inside a popup.
* 🔔 **Dynamic Warning Days Logics:** Upgrade expiration alert badges to trigger exactly when the custom "warning days" threshold is met, rather than using fixed 10 or 30-day default thresholds.
* 📐 **Import/Export Restyling:** Reposition the database import and export buttons into a more strategic and seamless area of the card layout.

### 🛠️ Technologies Used
1. **Backend Core:** Simple Inventory Python Integration (Home Assistant custom component).
2. **Scanning Engine:** Html5-QRCode (A local, lightweight JavaScript library loaded *on-demand* to decode EAN-13, EAN-8, and Code-128 formats).
3. **Information Database:** Open Food Facts API v3 (An open-source public service for product technical sheet extraction).

### 🔐 Security Requirements & Camera Settings
Due to strict sandbox and privacy policies enforced by modern browsers (Google Chrome, Android WebView, etc.), **the camera scanner will only start within a secure context**.

#### 1. Secure Connection (Recommended)
Access your Home Assistant instance using a protected **`https://`** URL (e.g., via *Nabu Casa Cloud*, *DuckDNS Let's Encrypt*, or a local reverse SSL proxy).

#### 2. Local IP Bypass (Workaround for unsecured `http://` connections)
If you access Home Assistant solely via an internal IP address (e.g., `http://1.xx`), you must explicitly force your browser to trust it:
1. Open **Google Chrome** on your Android device or PC.
2. Navigate to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Change the dropdown setting to **`Enabled`**.
4. Enter your exact Home Assistant IP address and port inside the text box (e.g., `http://1.xx`).
5. Click **`Relaunch`** at the bottom right to restart Chrome.

#### 3. Android App Permissions
Ensure the official Home Assistant app (or your mobile browser) has system-level permission to use the camera hardware (*Settings ➡️ Apps ➡️ Home Assistant ➡️ Permissions ➡️ Camera ➡️ Allow while using the app*).

### 📥 HACS Installation Guide
Thanks to HACS integration compliance, installation and future updates are handled fully automatically.

#### 1. Add the Custom Repository
1. Open Home Assistant and click on **HACS** in the sidebar.
2. Click the **three dots** in the top-right corner and select **Custom repositories**.
3. Paste your GitHub repository URL into the text box:  
   `https://github.com`
4. Under **Category**, select **Plugin** (or *Lovelace*).
5. Click **Add**.

#### 2. Download and Register the Module
1. The card will instantly show up under the HACS new repositories list.
2. Click on the card name, select **Download** at the bottom right, and pick the latest stable release tag.
3. HACS will handle the file layout inside `/config/www/community/simple-inventory-enhanced-card/`.
4. Once completed, click **Reload browser** if prompted to flush Home Assistant's local UI cache.

### ⚙️ Lovelace Configuration (Example)
```yaml
type: custom:simple-inventory-enhanced-card
entity: sensor.simple_inventory_pantry # Your entity generated by the Python backend
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


---

# Versione Italiana

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
* **📡 Integrazione Smart Open Food Facts:** Se inquadri un prodotto inedito, la card interroga in tempo reale l'API mondiale recuperando istantaneamente Nome Prodotto, Categoria e Confezione netta (es. *500 Grammi*, *1 Litro*) precompilando il form.
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
