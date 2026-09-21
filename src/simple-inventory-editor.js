import { getTranslation } from './simple-inventory-lang.js';

export class SimpleInventoryEnhancedCardEditor extends HTMLElement {
  setConfig(config) { 
    this._config = config || {}; 
    if (this._hass && !this._initialized) {
      this.initEditor();
    } else if (this._initialized) {
      this.syncData();
    }
  }

  get config() { return this._config; }
  
  set config(config) { 
    this._config = config || {}; 
    if (this._initialized) { 
      this.syncData(); 
    } 
  }

  set hass(hass) { 
    this._hass = hass; 
    if (!this._initialized && this._config) { 
      this.initEditor(); 
    } else if (this._initialized) { 
      this.shadowRoot.querySelectorAll("ha-form").forEach(form => { form.hass = this._hass; }); 
    } 
  }

  initEditor() {
    if (!this._hass || !this._config) return;
    this._initialized = true; 
    this.attachShadow({ mode: 'open' });
    const lang = getTranslation(this._hass);
    
    this.shadowRoot.innerHTML = `
      <style>
        .editor-container { display: flex; flex-direction: column; gap: 12px; font-family: var(--paper-font-body1_-_font-family, sans-serif); color: var(--primary-text-color); }
        ha-expansion-panel { --expansion-panel-summary-padding: 0 8px; border: 1px solid var(--divider-color); border-radius: 6px; }
        .panel-header { font-weight: bold; font-size: 0.95rem; color: var(--primary-text-color); }
        .form-row { padding: 12px; display: flex; flex-direction: column; gap: 14px; }
        .select-option { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .select-label { font-size: 0.85rem; color: var(--secondary-text-color); font-weight: 500; }
        
        .coppia-row {
          display: flex !important; flex-direction: row !important; gap: 12px !important; width: 100% !important; align-items: flex-end !important;
        }
        .coppia-row ha-form { flex: 1 !important; min-width: 0 !important; }

        .color-row {
          display: grid !important;
          grid-template-columns: 2fr 1fr !important;
          gap: 12px !important;
          width: 100% !important;
          align-items: center !important;
          padding: 4px 0;
        }
        .color-row.with-days {
          grid-template-columns: 1fr 2fr 1fr !important;
        }
        .input-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .input-label { font-size: 0.85rem; color: var(--secondary-text-color); font-weight: 500; }
        
        input[type="color"] {
          -webkit-appearance: none; border: 1px solid var(--divider-color); border-radius: 4px;
          width: 100%; height: 44px; cursor: pointer; background: var(--card-background-color); padding: 4px; box-sizing: border-box;
        }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
        
        input[type="number"] {
          width: 100%; padding: 12px; border-radius: 4px; border: 1px solid var(--divider-color);
          background: var(--card-background-color); color: var(--primary-text-color); font-size: 1rem;
          font-family: inherit; box-sizing: border-box; outline: none; height: 44px;
        }

        input[type="number"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--secondary-background-color);
        }

        ha-form { display: flex !important; flex-direction: column !important; gap: 2px !important; }
        ha-form * { --form-row-margin-bottom: 2px !important; margin-bottom: 2px !important; }
        select.custom-dropdown { width: 100%; padding: 12px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font-size: 1rem; font-family: inherit; box-sizing: border-box; cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;utf8,<svg fill='%23999999' height='24' viewBox='0 0 24 24' width='24' xmlns='http://w3.org'><path d='M7 10l5 5 5-5z'/></svg>"); background-repeat: no-repeat; background-position: right 8px center; }
        
        #secret-debug-container {
          display: none;
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid #ff9800;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 12px;
        }
        #secret-debug-container.visible {
          display: block;
        }
      </style>
      <div class="editor-container">
        <div id="secret-debug-container">
          <ha-form id="form-debug-toggle"></ha-form>
        </div>

        <ha-expansion-panel expanded>
          <div slot="header" class="panel-header">${lang.ed_panel_base}</div>
          <div class="form-row">
            <ha-form id="form-base-ent"></ha-form>
            <div class="coppia-row">
              <ha-form id="form-base-title"></ha-form>
              <ha-form id="form-base-cols"></ha-form>
            </div>
            <div class="coppia-row">
              <ha-form id="form-base-t1"></ha-form>
              <ha-form id="form-base-t2"></ha-form>
            </div>
            <div class="coppia-row">
              <ha-form id="form-base-t3"></ha-form>
              <ha-form id="form-base-t4"></ha-form>
            </div>
            <ha-form id="form-base-t5"></ha-form>
            <div class="select-option">
              <span class="select-label">${lang.ed_sort_label}</span>
              <select id="default_sort" class="custom-dropdown">
                <option value="alpha" ${this._config && this._config.default_sort === 'alpha' ? 'selected' : ''}>${lang.sort_alpha}</option>
                <option value="alpha_avail" ${this._config && this._config.default_sort === 'alpha_avail' ? 'selected' : ''}>${lang.sort_alpha_avail}</option>
                <option value="alpha_desc" ${this._config && this._config.default_sort === 'alpha_desc' ? 'selected' : ''}>${lang.sort_alpha_desc}</option>
                <option value="alpha_desc_avail" ${this._config && this._config.default_sort === 'alpha_desc_avail' ? 'selected' : ''}>${lang.sort_alpha_desc_avail}</option>
                <option value="threshold" ${this._config && this._config.default_sort === 'threshold' ? 'selected' : ''}>${lang.sort_threshold}</option>
                <option value="threshold_avail" ${this._config && this._config.default_sort === 'threshold_avail' ? 'selected' : ''}>${lang.sort_threshold_avail}</option>
                <option value="expiry" ${this._config && this._config.default_sort === 'expiry' ? 'selected' : ''}>${lang.sort_expiry}</option>
                <option value="expiring_soon_desc" ${this._config && this._config.default_sort === 'expiring_soon_desc' ? 'selected' : ''}>${lang.sort_expiring_soon_desc}</option>
                <option value="only_expired" ${this._config && this._config.default_sort === 'only_expired' ? 'selected' : ''}>${lang.sort_only_expired}</option>
                <option value="only_empty" ${this._config && this._config.default_sort === 'only_empty' ? 'selected' : ''}>${lang.sort_only_empty}</option>
              </select>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <div slot="header" class="panel-header">${lang.ed_panel_summary}</div>
          <div class="form-row">
            <div class="coppia-row">
              <ha-form id="form-sum-cols"></ha-form>
              <ha-form id="form-sum-t1"></ha-form>
            </div>
            <div class="coppia-row">
              <ha-form id="form-sum-t2"></ha-form>
              <ha-form id="form-sum-t3"></ha-form>
            </div>
            <div class="coppia-row">
              <ha-form id="form-sum-t4"></ha-form>
              <ha-form id="form-sum-t5"></ha-form>
            </div>
            <div class="coppia-row">
              <ha-form id="form-sum-t6"></ha-form>
              <ha-form id="form-sum-t7"></ha-form>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <div slot="header" class="panel-header">${lang.ed_panel_expiry}</div>
          <div class="form-row">
            ${this._createColorBlock("color_expired", "alpha_expired", "Colore Scaduto", "#db4437", "disabled_days_0", 0, true, "Giorni")}
            ${this._createColorBlock("color_10d", "alpha_10d", "Colore Allerta", "#e6a23c", "days_10d", 10, false, "Giorni")}
            ${this._createColorBlock("color_30d", "alpha_30d", "Colore Avviso", "#ffeb3b", "days_30d", 30, false, "Giorni")}
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel>
          <div slot="header" class="panel-header">${lang.ed_panel_qty}</div>
          <div class="form-row">
            ${this._createColorBlock("color_qty0", "alpha_qty0", "Colore Esaurito", "#db4437", "disabled_qty_0", 0, true, "Quantità")}
            ${this._createColorBlock("color_qty1", "alpha_qty1", "Colore Critico", "#f44336", "qty_1", 1, false, "Quantità")}
            ${this._createColorBlock("color_qty3", "alpha_qty3", "Colore Minimo", "#ff9800", "qty_3", 3, false, "Quantità")}
          </div>
        </ha-expansion-panel>
      </div>
    `;
    this.renderForms(lang); 
    this.setupSortListener(); 
    this._attachColorListeners();
    this._setupShiftListener();
  }

  _setupShiftListener() {
    this._handleKeyDown = (e) => {
      if (e.key === "Shift") {
        const debugBox = this.shadowRoot.getElementById("secret-debug-container");
        if (debugBox) debugBox.classList.add("visible");
      }
    };
    this._handleKeyUp = (e) => {
      if (e.key === "Shift") {
        const debugBox = this.shadowRoot.getElementById("secret-debug-container");
        if (debugBox && !this._config.debug_mode) {
          debugBox.classList.remove("visible");
        }
      }
    };
    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  disconnectedCallback() {
    if (this._handleKeyDown) window.removeEventListener("keydown", this._handleKeyDown);
    if (this._handleKeyUp) window.removeEventListener("keyup", this._handleKeyUp);
  }

  _createColorBlock(colorId, alphaId, labelKey, fallbackHex, daysId = null, fallbackDays = null, isDisabled = false, daysLabel = "Giorni") {
    const lang = getTranslation(this._hass);
    const labelText = lang[`ed_lbl_${colorId}`] || lang[colorId] || colorId;
    const alphaText = lang.ed_lbl_alpha_pct || "% Trasparenza";
    const daysText = daysLabel === "Quantità" ? (lang.ed_lbl_qty || "Quantità") : (lang.ed_lbl_days || "Giorni");
    
    const currentHex = this._config[colorId] || fallbackHex;
    const currentAlpha = this._config[alphaId] !== undefined ? this._config[alphaId] : 100;
    const currentDays = daysId ? (this._config[daysId] !== undefined ? this._config[daysId] : fallbackDays) : null;

    if (daysId) {
      return `
        <div class="color-row with-days">
          <div class="input-group">
            <span class="input-label">${daysText}</span>
            <input type="number" id="${daysId}_input" min="0" max="365" step="1" value="${currentDays}" ${isDisabled ? 'disabled' : ''}>
          </div>
          <div class="input-group">
            <span class="input-label">${labelText}</span>
            <input type="color" id="${colorId}_input" value="${currentHex}">
          </div>
          <div class="input-group">
            <span class="input-label">${alphaText}</span>
            <input type="number" id="${alphaId}_input" min="0" max="100" step="5" value="${currentAlpha}">
          </div>
        </div>
      `;
    }

    return `
      <div class="color-row">
        <div class="input-group">
          <span class="input-label">${labelText}</span>
          <input type="color" id="${colorId}_input" value="${currentHex}">
        </div>
        <div class="input-group">
          <span class="input-label">${alphaText}</span>
          <input type="number" id="${alphaId}_input" min="0" max="100" step="5" value="${currentAlpha}">
        </div>
      </div>
    `;
  }

  _attachColorListeners() {
    const shadow = this.shadowRoot;
    ["color_expired", "color_10d", "color_30d", "color_qty0", "color_qty1", "color_qty3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`);
      if (el) {
        el.addEventListener("change", (e) => {
          this._config = { ...this._config, [id]: e.target.value }; 
          this.fireConfigChanged();
        });
      }
    });
    ["alpha_expired", "alpha_10d", "alpha_30d", "alpha_qty0", "alpha_qty1", "alpha_qty3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`);
      if (el) {
        el.addEventListener("change", (e) => {
          this._config = { ...this._config, [id]: parseInt(e.target.value, 10) || 0 }; 
          this.fireConfigChanged();
        });
      }
    });
    ["days_10d", "days_30d", "qty_1", "qty_3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`);
      if (el) {
        el.addEventListener("change", (e) => {
          this._config = { ...this._config, [id]: parseInt(e.target.value, 10) || 0 }; 
          this.fireConfigChanged();
          this.renderForms(getTranslation(this._hass));
        });
      }
    });
  }

  renderForms(lang) {
    const defaultData = { title: "", columns: 2, summary_columns: 4, default_sort: "alpha", show_summary: true, show_items: true, show_add_form: true, show_search: true, show_sort: true, show_ico_total: true, show_ico_expired: true, show_ico_10d: true, show_ico_30d: true, show_ico_qty0: true, show_ico_qty1: true, show_ico_qty3: true, debug_mode: false, ...this._config };
    
    const days10d = this._config.days_10d !== undefined ? this._config.days_10d : 10;
    const days30d = this._config.days_30d !== undefined ? this._config.days_30d : 30;
    const qty1Val = this._config.qty_1 !== undefined ? this._config.qty_1 : 1;
    const qty3Val = this._config.qty_3 !== undefined ? this._config.qty_3 : 3;

    const labels = { 
      entity: lang.ed_lbl_entity, 
      title: lang.ed_lbl_title, 
      columns: lang.ed_lbl_columns, 
      summary_columns: lang.ed_lbl_summary_columns,
      show_summary: lang.ed_lbl_show_summary, 
      show_items: lang.ed_lbl_show_items, 
      show_add_form: lang.add_trigger_label, 
      show_search: lang.ed_lbl_show_search, 
      show_sort: lang.ed_lbl_show_sort, 
      show_ico_total: lang.ed_lbl_ico_total, 
      show_ico_expired: lang.ed_lbl_ico_expired, 
      show_ico_10d: (lang.ed_lbl_ico_10d, days10d), 
      show_ico_30d: (lang.ed_lbl_ico_30d, days30d), 
      show_ico_qty0: (lang.ed_lbl_ico_qty0), 
      show_ico_qty1: (lang.ed_lbl_ico_qty1, qty1Val), 
      show_ico_qty3: (lang.ed_lbl_ico_qty3, qty3Val),
      debug_mode: "Modalità Debug Log (console.log)"
    };
    this._computeLabel = (schemaItem) => labels[schemaItem.name] || schemaItem.name;
    
    this.setupForm("form-debug-toggle", [{ name: "debug_mode", selector: { boolean: {} } }], defaultData);

    this.setupForm("form-base-ent", [{ name: "entity", selector: { entity: { domain: "sensor", filter: { integration: "simple_inventory" } } } }], defaultData);
    this.setupForm("form-base-title", [{ name: "title", selector: { text: {} } }], defaultData);
    this.setupForm("form-base-cols", [{ name: "columns", selector: { number: { min: 1, max: 6, mode: "box" } } }], defaultData);
    
    this.setupForm("form-base-t1", [{ name: "show_summary", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-base-t2", [{ name: "show_items", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-base-t3", [{ name: "show_add_form", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-base-t4", [{ name: "show_search", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-base-t5", [{ name: "show_sort", selector: { boolean: {} } }], defaultData);

    this.setupForm("form-sum-cols", [{ name: "summary_columns", selector: { number: { min: 0, max: 7, mode: "box" } } }], defaultData);
    this.setupForm("form-sum-t1", [{ name: "show_ico_total", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t2", [{ name: "show_ico_expired", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t3", [{ name: "show_ico_10d", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t4", [{ name: "show_ico_30d", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t5", [{ name: "show_ico_qty0", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t6", [{ name: "show_ico_qty1", selector: { boolean: {} } }], defaultData);
    this.setupForm("form-sum-t7", [{ name: "show_ico_qty3", selector: { boolean: {} } }], defaultData);
    
    this.shadowRoot.querySelectorAll("ha-form").forEach(form => { form.hass = this._hass; });

    const debugBox = this.shadowRoot.getElementById("secret-debug-container");
    if (debugBox) {
      if (this._config.debug_mode) debugBox.classList.add("visible");
    }
  }

  setupForm(formId, schema, data) { 
    const haForm = this.shadowRoot.getElementById(formId); 
    if (!haForm) return; 
    haForm.hass = this._hass; 
    haForm.schema = schema; 
    haForm.data = data; 
    haForm.computeLabel = this._computeLabel; 
    haForm.addEventListener("value-changed", (e) => { 
      e.stopPropagation(); 
      this._config = { ...this._config, ...e.detail.value }; 
      this.fireConfigChanged(); 
    }); 
  }

  setupSortListener() { 
    const selectSort = this.shadowRoot.getElementById("default_sort"); 
    if (!selectSort) return; 
    selectSort.addEventListener("change", () => { 
      this._config = { ...this._config, default_sort: selectSort.value }; 
      this.fireConfigChanged(); 
    }); 
  }

  fireConfigChanged() { 
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })); 
  }
  
  syncData() { 
    const shadow = this.shadowRoot; 
    if (!shadow) return;
    const currentData = { ...this._config }; 
    
    shadow.querySelectorAll("ha-form").forEach(form => { 
      form.data = { ...form.data, ...currentData }; 
    }); 
    
    const selectSort = shadow.getElementById("default_sort"); 
    if (selectSort) { 
      selectSort.value = this._config.default_sort || "alpha"; 
    } 
    
    ["color_expired", "color_10d", "color_30d", "color_qty0", "color_qty1", "color_qty3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`); 
      if (el && this._config[id]) el.value = this._config[id];
    });
    ["alpha_expired", "alpha_10d", "alpha_30d", "alpha_qty0", "alpha_qty1", "alpha_qty3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`); 
      if (el && this._config[id] !== undefined) el.value = this._config[id];
    });
    ["days_10d", "days_30d", "qty_1", "qty_3"].forEach(id => {
      const el = shadow.getElementById(`${id}_input`); 
      if (el && this._config[id] !== undefined) el.value = this._config[id];
    });

    const debugBox = shadow.getElementById("secret-debug-container");
    if (debugBox) {
      if (this._config.debug_mode) debugBox.classList.add("visible");
    }
  }
}

if (!customElements.get("simple-inventory-enhanced-card-editor")) {
  customElements.define("simple-inventory-enhanced-card-editor", SimpleInventoryEnhancedCardEditor);
}