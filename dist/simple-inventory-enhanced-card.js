import './simple-inventory-editor.js';
import { cardStyles } from './simple-inventory-styles.js';
import { renderCardContent } from './simple-inventory-renderer.js';

class SimpleInventoryEnhancedCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("simple-inventory-enhanced-card-editor");
  }

  static getStubConfig() {
    return {
      title: "", columns: 2, default_sort: "alpha", show_summary: true,
      show_items: true, show_add_form: true, show_search: true, show_sort: true,
      show_ico_total: true, show_ico_expired: true, show_ico_10d: true, show_ico_30d: true,
      show_ico_qty0: true, show_ico_qty1: true, show_ico_qty3: true,
      color_expired: "#db4437", color_10d: "#e6a23c", color_30d: "#ffeb3b",
      color_qty0: "#db4437", color_qty1: "#f44336", color_qty3: "#ff9800",
      alpha_expired: 100, alpha_10d: 100, alpha_30d: 100, alpha_qty0: 100, alpha_qty1: 100, alpha_qty3: 100
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) { this.initCard(); }
    if (this.config && this.config.entity && !this._initialFetched) { this.fetchInventoryItems(); }
  }

  setConfig(config) {
    const baseConfig = config || {};
    this.config = {
      title: baseConfig.title ? baseConfig.title : "",
      columns: baseConfig.columns !== undefined ? baseConfig.columns : 2,
      default_sort: baseConfig.default_sort || "alpha",
      show_summary: baseConfig.show_summary !== undefined ? baseConfig.show_summary : true,
      show_items: baseConfig.show_items !== undefined ? baseConfig.show_items : true,
      show_add_form: baseConfig.show_add_form !== undefined ? baseConfig.show_add_form : true,
      show_search: baseConfig.show_search !== undefined ? baseConfig.show_search : true,
      show_sort: baseConfig.show_sort !== undefined ? baseConfig.show_sort : true,
      show_ico_total: baseConfig.show_ico_total !== undefined ? baseConfig.show_ico_total : true,
      show_ico_expired: baseConfig.show_ico_expired !== undefined ? baseConfig.show_ico_expired : true,
      show_ico_10d: baseConfig.show_ico_10d !== undefined ? baseConfig.show_ico_10d : true,
      show_ico_30d: baseConfig.show_ico_30d !== undefined ? baseConfig.show_ico_30d : true,
      show_ico_qty0: baseConfig.show_ico_qty0 !== undefined ? baseConfig.show_ico_qty0 : true,
      show_ico_qty1: baseConfig.show_ico_qty1 !== undefined ? baseConfig.show_ico_qty1 : true,
      show_ico_qty3: baseConfig.show_ico_qty3 !== undefined ? baseConfig.show_ico_qty3 : true,
      color_expired: baseConfig.color_expired || "#db4437",
      color_10d: baseConfig.color_10d || "#e6a23c",
      color_30d: baseConfig.color_30d || "#ffeb3b",
      color_qty0: baseConfig.color_qty0 || "#db4437",
      color_qty1: baseConfig.color_qty1 || "#f44336",
      color_qty3: baseConfig.color_qty3 || "#ff9800",
      alpha_expired: baseConfig.alpha_expired !== undefined ? baseConfig.alpha_expired : 100,
      alpha_10d: baseConfig.alpha_10d !== undefined ? baseConfig.alpha_10d : 100,
      alpha_30d: baseConfig.alpha_30d !== undefined ? baseConfig.alpha_30d : 100,
      alpha_qty0: baseConfig.alpha_qty0 !== undefined ? baseConfig.alpha_qty0 : 100,
      alpha_qty1: baseConfig.alpha_qty1 !== undefined ? baseConfig.alpha_qty1 : 100,
      alpha_qty3: baseConfig.alpha_qty3 !== undefined ? baseConfig.alpha_qty3 : 100,
      entity: baseConfig.entity || ""
    };
    this.searchQuery = this.searchQuery || "";
    this._summaryExpanded = this._summaryExpanded !== undefined ? this._summaryExpanded : true;
    this._showAddPopup = this._showAddPopup !== undefined ? this._showAddPopup : false;
    this._editingItemId = this._editingItemId || null;

    if (!this._hasSetDefaultSort || this._oldDefaultSort !== this.config.default_sort) {
      this.currentSort = this.config.default_sort; this._oldDefaultSort = this.config.default_sort; this._hasSetDefaultSort = true;
    }
    if (this._oldEntity !== this.config.entity) { this._oldEntity = this.config.entity; this._initialFetched = false; }
    if (this.content) { this.applyGridStyles(); this.updateCard(); }
  }


  async fetchInventoryItems() {
    if (!this.config || !this.config.entity) return;
    const stateObj = this._hass.states[this.config.entity];
    if (!stateObj) return;
    const inventoryId = stateObj.attributes.inventory_id;
    if (!inventoryId) return;
    this._initialFetched = true;
    try {
      const result = await this._hass.connection.sendMessagePromise({
        type: "simple_inventory/list_items", inventory_id: inventoryId
      });
      if (result && result.items) { this.inventoryItems = result.items; this.updateCard(); }
    } catch (e) { console.error("Errore WebSocket:", e); }
  }

  applyGridStyles() {
    const grid = this.shadowRoot.getElementById("grid");
    const columnsCount = this.config ? this.config.columns : 2;
    if (grid) { grid.style.gridTemplateColumns = `repeat(${columnsCount}, minmax(0, 1fr))`; }
  }

  initCard() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>${cardStyles}</style>
      <ha-card>
        <div class="header-container">
          <div class="title-row">
            <div class="card-header-text" id="card-title"></div>
            
            <!-- NUOVO GRUPPO DI PULSANTI AFFIANCATI IN ALTO A DESTRA -->
            <div class="header-buttons">
              <button id="export-btn" class="io-btn" title="Export JSON">Exp</button>
              <button id="import-btn" class="io-btn" title="Import JSON">Imp</button>
              <button id="add-trigger-btn" class="add-trigger-btn" style="display:none;"></button>
            </div>
          </div>
          <div id="summary-area" class="summary-box"></div>
          <div id="add-popup-container"></div>
          <div id="controls-container" class="controls">
            <input type="text" class="search-bar" id="search-input">
            <select class="sort-select" id="sort-select"></select>
          </div>
        </div>
        <div id="grid" class="inventory-grid"></div>
      </ha-card>
    `;
    this.content = this.shadowRoot.getElementById("grid");
    this.applyGridStyles();
    
    this.shadowRoot.getElementById("search-input").addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase(); this.updateCard();
    });
    this.shadowRoot.getElementById("add-trigger-btn").addEventListener("click", () => {
      this._showAddPopup = true; this.updateCard();
    });

    // LOGICA DI ESPORTAZIONE: Crea un file .json scaricabile dal browser contenente l'array di prodotti corrente
    this.shadowRoot.getElementById("export-btn").addEventListener("click", () => {
      if (!this.inventoryItems || this.inventoryItems.length === 0) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.inventoryItems, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${this.config.entity || 'inventario'}_backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    this.shadowRoot.getElementById("import-btn").addEventListener("click", () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file'; fileInput.accept = '.json';
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            const importedItems = JSON.parse(evt.target.result);
            if (!Array.isArray(importedItems)) throw new Error("File non valido. Deve contenere un array JSON.");
            
            const stateObj = this._hass.states[this.config.entity];
            const inventoryId = stateObj.attributes.inventory_id;
            if (!inventoryId) return;

            if (!confirm(`Vuoi procedere al caricamento di ${importedItems.length} prodotti in questo inventario?`)) return;

            for (const item of importedItems) {
              if (!item.name) continue;
              const serviceData = {
                inventory_id: inventoryId,
                name: item.name,
                quantity: parseFloat(item.quantity) || 0,
                expiry_date: item.expiry_date || "",
                unit: item.unit || "",
                category: item.category || "",
                location: item.location || "",
                description: item.description || "",
                barcodes: item.barcodes || item.barcode_id || item.barcode || ""
              };
              await this._hass.callService("simple_inventory", "add_item", serviceData);
            }
            alert("Importazione completata con successo!");
            this._initialFetched = false; this.fetchInventoryItems();
          } catch (err) { alert("Errore di importazione: " + err.message); }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    });
  }

  updateCard() { renderCardContent(this); }
  async adjustQuantity(itemName, diff) { if (!this.config || !this.config.entity) return; const stateObj = this._hass.states[this.config.entity]; const inventoryId = stateObj.attributes.inventory_id; if (!inventoryId) return; const serviceName = diff > 0 ? "increment_item" : "decrement_item"; await this._hass.callService("simple_inventory", serviceName, { inventory_id: inventoryId, name: itemName, amount: Math.abs(diff) }); this._initialFetched = false; this.fetchInventoryItems(); }
  getCardSize() { return 3; }
}

customElements.define('simple-inventory-enhanced-card', SimpleInventoryEnhancedCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "simple-inventory-enhanced-card", name: "Simple Inventory Enhanced Card", description: "Card ultra-compatta a griglia avanzata.", preview: true, configurable: true });
