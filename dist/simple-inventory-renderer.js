import { getEditFormHtml, getAddPopupHtml } from './simple-inventory-templates.js';
import { deleteItemDefinitivelyService, handleSaveEditService, handleAddItemService } from './simple-inventory-services.js';
import { getTranslation } from './simple-inventory-lang.js';
import { startCameraScanner } from './simple-inventory-scanner.js'; 
import { filterAndSortItems } from './simple-inventory-filters.js';
import { renderSingleItemCard } from './simple-inventory-cards.js';

export function renderCardContent(cardInstance) {
  if (!cardInstance || !cardInstance.config) return;
  const lang = getTranslation(cardInstance._hass);
  
  // 1. GESTIONE TITOLO ROBUSTA
  const titleEl = cardInstance.shadowRoot ? cardInstance.shadowRoot.getElementById("card-title") : null;
  if (titleEl) {
    let computedTitle = cardInstance.config.title;
    
    if (!computedTitle || computedTitle.trim() === "") {
      const stateObj = (cardInstance._hass && cardInstance._hass.states && cardInstance.config.entity) 
        ? cardInstance._hass.states[cardInstance.config.entity] 
        : null;
      
      const friendlyName = stateObj && stateObj.attributes ? stateObj.attributes.friendly_name : null;
      
      computedTitle = friendlyName || cardInstance.config.entity || (lang && lang.select_entity_error ? lang.select_entity_error : "Seleziona Inventario");
    }
    
    titleEl.textContent = computedTitle;
  }

  // 2. RENDERING MESSAGGIO INVENTARIO VUOTO / SENZA ENTITÀ SULLA GRIGLIA
  if (!cardInstance.config.entity) {
    if (cardInstance.content) {
      cardInstance.content.innerHTML = `<div style='padding: 10px; color: var(--secondary-text-color);'>${lang ? lang.select_entity_error : 'Seleziona un\'entità nelle impostazioni'}</div>`;
    }
  } else if (!cardInstance.inventoryItems || cardInstance.inventoryItems.length === 0) {
    if (cardInstance.content) {
      cardInstance.content.innerHTML = `<div style='padding: 10px; color: var(--secondary-text-color);'>${lang ? lang.loading_items : 'Nessun articolo trovato'}</div>`;
    }
  }

  const dynamicCategories = [];
  if (cardInstance.inventoryItems && Array.isArray(cardInstance.inventoryItems)) {
    cardInstance.inventoryItems.forEach(item => {
      const q = item.quantity !== undefined ? item.quantity : 0;
      if (q > 0) {
        const catName = item.category && item.category.trim() !== "" ? item.category.trim() : lang.senza_categoria;
        if (!dynamicCategories.includes(catName)) { dynamicCategories.push(catName); }
      }
    });
  }
  dynamicCategories.sort((a, b) => a.localeCompare(b));

  // 3. DROPDOWN ORDINAMENTO
  const selectSort = cardInstance.shadowRoot.getElementById("sort-select");
  if (selectSort && cardInstance.config.show_sort) {
    let sortOptionsHtml = `
      <option value="alpha" ${cardInstance.currentSort === 'alpha' ? 'selected' : ''}>${lang.sort_alpha}</option>
      <option value="alpha_avail" ${cardInstance.currentSort === 'alpha_avail' ? 'selected' : ''}>${lang.sort_alpha_avail}</option>
      <option value="alpha_desc" ${cardInstance.currentSort === 'alpha_desc' ? 'selected' : ''}>${lang.sort_alpha_desc}</option>
      <option value="alpha_desc_avail" ${cardInstance.currentSort === 'alpha_desc_avail' ? 'selected' : ''}>${lang.sort_alpha_desc_avail}</option>
      <option value="threshold" ${cardInstance.currentSort === 'threshold' ? 'selected' : ''}>${lang.sort_threshold}</option>
      <option value="threshold_avail" ${cardInstance.currentSort === 'threshold_avail' ? 'selected' : ''}>${lang.sort_threshold_avail}</option>
      <option value="expiry" ${cardInstance.currentSort === 'expiry' ? 'selected' : ''}>${lang.sort_expiry}</option>
      <option value="only_expired" ${cardInstance.currentSort === 'only_expired' ? 'selected' : ''}>${lang.sort_only_expired}</option>
      <option value="only_empty" ${cardInstance.currentSort === 'only_empty' ? 'selected' : ''}>${lang.sort_only_empty}</option>
    `;
    dynamicCategories.forEach(cat => {
      const optionValue = `cat_${cat}`;
      const labelText = lang.sort_cat_label.replace("{cat}", cat);
      sortOptionsHtml += `<option value="${optionValue}" ${cardInstance.currentSort === optionValue ? 'selected' : ''}>${labelText}</option>`;
    });
    selectSort.innerHTML = sortOptionsHtml;
    if (!selectSort._hasListener) {
      selectSort.addEventListener("change", (e) => { cardInstance.currentSort = e.target.value; cardInstance.updateCard(); });
      selectSort._hasListener = true;
    }
  }

  if (selectSort) {
    if (cardInstance.config.show_sort) selectSort.classList.add("visible");
    else selectSort.classList.remove("visible");
  }

  // 4. BARRA DI RICERCA
  const searchBar = cardInstance.shadowRoot.getElementById("search-input");
  const controlsContainer = cardInstance.shadowRoot.getElementById("controls-container");
  if (searchBar && controlsContainer) {
    searchBar.placeholder = lang.search_placeholder;
    if (cardInstance.config.show_search) searchBar.classList.add("visible");
    else searchBar.classList.remove("visible");
    if (cardInstance.config.show_search || cardInstance.config.show_sort) controlsContainer.classList.add("visible");
    else controlsContainer.classList.remove("visible");

    if (!searchBar._hasBarcodeListener) {
      searchBar.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          const rawCode = searchBar.value.trim();
          if (!rawCode || !cardInstance.inventoryItems) return;
          const exactMatch = cardInstance.inventoryItems.find(i => {
            const b = i.barcodes || i.barcode_id || i.barcode || "";
            return b.trim() === rawCode;
          });
          if (exactMatch) {
            e.preventDefault();
            searchBar.value = ""; 
            cardInstance.searchQuery = "";
            await cardInstance.adjustQuantity(exactMatch.name, 1);
          }
        }
      });
      searchBar._hasBarcodeListener = true;
    }
  }

  // 5. PULSANTE AGGIUNGI E SCANNER BARCODE
  const addTriggerBtn = cardInstance.shadowRoot.getElementById("add-trigger-btn");
  if (addTriggerBtn) { 
    addTriggerBtn.innerText = lang.btn_add;
    addTriggerBtn.style.display = cardInstance.config.show_add_form ? "flex" : "none"; 
    
    let scanBtn = cardInstance.shadowRoot.getElementById("header-scan-btn");
    if (!scanBtn && cardInstance.config.show_add_form) {
      scanBtn = document.createElement("button");
      scanBtn.id = "header-scan-btn";
      scanBtn.innerHTML = `<ha-icon icon="mdi:barcode-scan"></ha-icon>`;
      scanBtn.style = "background:var(--primary-color); border:none; color:white; padding:0 8px; border-radius:4px; height:34px; margin-left:6px; cursor:pointer; display:flex; align-items:center; justify-content:center;";
      addTriggerBtn.parentNode.insertBefore(scanBtn, addTriggerBtn.nextSibling);
      scanBtn.addEventListener("click", () => { startCameraScanner(cardInstance, lang); });
    }
  }

  const addPopupContainer = cardInstance.shadowRoot.getElementById("add-popup-container");

  if (cardInstance.content) {
    if (cardInstance.config.show_items) cardInstance.content.classList.add("visible");
    else cardInstance.content.classList.remove("visible");
  }

  // 6. CALCOLO E RENDERING RIEPILOGO (Soglie Dinamiche Scadenze e Quantità)
  let totalItems = 0, expiredCount = 0, exp10Count = 0, exp30Count = 0, qty0Count = 0, qtyLowCount = 0, qtyWarningCount = 0;
  
  const days10d = cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;
  
  const qtyLowVal = cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qtyWarningVal = cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

  if (cardInstance.inventoryItems && Array.isArray(cardInstance.inventoryItems)) {
    cardInstance.inventoryItems.forEach(item => {
      const q = item.quantity !== undefined ? item.quantity : 0;
      totalItems += q;
      if (q === 0) qty0Count++;
      if (q === qtyLowVal) qtyLowCount++;
      if (q === qtyWarningVal) qtyWarningCount++;
      
      if (item.expiry_date && q > 0) {
        const today = new Date(); today.setHours(0,0,0,0);
        const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
        const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (days < 0) expiredCount++;
        else if (days <= days10d) exp10Count++;
        else if (days <= days30d) exp30Count++;
      }
    });
  }

  const summaryArea = cardInstance.shadowRoot.getElementById("summary-area");
  if (cardInstance.config.show_summary) {
    summaryArea.classList.add("visible");
    let htmlContent = "";
    const cExp = cardInstance.config.color_expired || "#db4437";
    const c10d = cardInstance.config.color_10d || "#e6a23c";
    const c30d = cardInstance.config.color_30d || "#ffeb3b";
    const cQ0  = cardInstance.config.color_qty0 || "#db4437";
    const cQ1  = cardInstance.config.color_qty1 || "#f44336";
    const cQ3  = cardInstance.config.color_qty3 || "#ff9800";

    if (cardInstance.config.show_ico_total) { htmlContent += `<div class="summary-item"><ha-icon icon="mdi:package-variant-closed"></ha-icon> Tot: ${totalItems}</div>`; }
    if (cardInstance.config.show_ico_expired) { htmlContent += `<div class="summary-item" style="color: ${cExp};"><ha-icon icon="mdi:calendar-remove"></ha-icon> ${lang.ico_expired_lbl}: ${expiredCount}</div>`; }
    if (cardInstance.config.show_ico_10d) { htmlContent += `<div class="summary-item" style="color: ${c10d};"><ha-icon icon="mdi:calendar-clock"></ha-icon> ${lang.ico_days_lbl.replace("{days}", days10d)}: ${exp10Count}</div>`; }
    if (cardInstance.config.show_ico_30d) { htmlContent += `<div class="summary-item" style="color: ${c30d};"><ha-icon icon="mdi:calendar-month"></ha-icon> ${lang.ico_days_lbl.replace("{days}", days30d)}: ${exp30Count}</div>`; }
    if (cardInstance.config.show_ico_qty0) { htmlContent += `<div class="summary-item" style="color: ${cQ0};"><ha-icon icon="mdi:numeric-0-box"></ha-icon> ${lang.ico_qty_lbl.replace("{num}", "0")}: ${qty0Count}</div>`; }
    if (cardInstance.config.show_ico_qty1) { htmlContent += `<div class="summary-item" style="color: ${cQ1};"><ha-icon icon="mdi:numeric-${qtyLowVal}-box"></ha-icon> ${lang.ico_qty_lbl.replace("{num}", qtyLowVal)}: ${qtyLowCount}</div>`; }
    if (cardInstance.config.show_ico_qty3) { htmlContent += `<div class="summary-item" style="color: ${cQ3};"><ha-icon icon="mdi:numeric-${qtyWarningVal}-box"></ha-icon> ${lang.ico_qty_lbl.replace("{num}", qtyWarningVal)}: ${qtyWarningCount}</div>`; }
    summaryArea.innerHTML = htmlContent || `<div style='color:var(--secondary-text-color); font-size:0.8rem; padding:2px;'>${lang.no_counter_active}</div>`;
  } else { summaryArea.classList.remove("visible"); }

  // 7. GRIGLIA PRODOTTI
  if (cardInstance.inventoryItems && cardInstance.inventoryItems.length > 0) {
    const items = filterAndSortItems(cardInstance);

    const categoriesListArray = [];
    cardInstance.inventoryItems.forEach(i => {
      if (i.category && i.category.trim() !== "" && !categoriesListArray.includes(i.category.trim())) {
        categoriesListArray.push(i.category.trim());
      }
    });

    cardInstance.content.innerHTML = items.map(item => renderSingleItemCard(item, cardInstance, lang, categoriesListArray)).join('');

    cardInstance.content.querySelectorAll(".btn-inc").forEach(btn => { btn.addEventListener("click", (e) => { e.stopPropagation(); cardInstance.adjustQuantity(btn.dataset.name, 1); }); });
    cardInstance.content.querySelectorAll(".btn-dec").forEach(btn => { btn.addEventListener("click", (e) => { e.stopPropagation(); cardInstance.adjustQuantity(btn.dataset.name, -1); }); });
    cardInstance.content.querySelectorAll(".btn-delete").forEach(btn => { btn.addEventListener("click", (e) => { e.stopPropagation(); deleteItemDefinitivelyService(cardInstance, btn.dataset.name); }); });
    
    cardInstance.content.querySelectorAll(".edit-icon-btn").forEach(btn => { 
      btn.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        cardInstance._editingItemId = btn.dataset.id; 
        cardInstance.updateCard(); 
      }); 
    });
    
    cardInstance.content.querySelectorAll(".btn-cancel-edit").forEach(btn => { btn.addEventListener("click", (e) => { e.stopPropagation(); cardInstance._editingItemId = null; cardInstance.updateCard(); }); });
    cardInstance.content.querySelectorAll(".btn-save-edit").forEach(btn => { btn.addEventListener("click", (e) => { e.stopPropagation(); handleSaveEditService(cardInstance, btn.dataset.id, btn.dataset.oldname); }); });

    if (cardInstance._editingItemId) {
      const shadow = cardInstance.shadowRoot;
      const editQtyInput = shadow.getElementById("edit_qty");
      const editIncBtn = shadow.getElementById("edit-qty-inc");
      const editDecBtn = shadow.getElementById("edit-qty-dec");
      if (editQtyInput && editIncBtn && editDecBtn) {
        editIncBtn.addEventListener("click", (e) => { e.preventDefault(); editQtyInput.value = (parseFloat(editQtyInput.value) || 0) + 1; });
        editDecBtn.addEventListener("click", (e) => { e.preventDefault(); const cur = parseFloat(editQtyInput.value) || 0; if (cur > 0) editQtyInput.value = cur - 1; });
      }
      const editCatSelect = shadow.getElementById("edit_cat_select");
      const editCatContainer = shadow.getElementById("edit_cat_custom_container");
      const editCatCustomInput = shadow.getElementById("edit_cat_custom");
      if (editCatSelect && editCatContainer && editCatCustomInput) {
        editCatSelect.addEventListener("change", (e) => { if (e.target.value === "__NEW_CAT__") { editCatContainer.style.display = "block"; editCatCustomInput.value = ""; editCatCustomInput.focus(); } else { editCatContainer.style.display = "none"; } });
      }
      const editCheckbox = shadow.getElementById("edit_auto_add_checkbox");
      const editSubRow = shadow.getElementById("edit_auto_add_subrow");
      if (editCheckbox && editSubRow) {
        const editSubInputs = editSubRow.querySelectorAll("input, select");
        editCheckbox.addEventListener("change", (e) => { const isChecked = e.target.checked; editSubRow.style.opacity = isChecked ? "1" : "0.5"; editSubInputs.forEach(input => { if (isChecked) { input.removeAttribute("disabled"); input.disabled = false; } else { input.setAttribute("disabled", "true"); input.disabled = true; } }); });
      }
    }
  }

  // 8. POPUP PER L'INSERIMENTO DI NUOVI PRODOTTI
  if (addPopupContainer) {
    if (!cardInstance._showAddPopup) {
      addPopupContainer.innerHTML = "";
    } else {
      const todoListsArray = [];
      if (cardInstance._hass && cardInstance._hass.states) {
        Object.keys(cardInstance._hass.states).forEach(entityId => {
          if (entityId.startsWith("todo.")) {
            const stateObj = cardInstance._hass.states[entityId];
            const friendlyName = (stateObj.attributes && stateObj.attributes.friendly_name) 
              ? stateObj.attributes.friendly_name 
              : entityId;
            todoListsArray.push({ entity_id: entityId, name: friendlyName });
          }
        });
      }
      todoListsArray.sort((a, b) => a.name.localeCompare(b.name));

      const categoriesListArray = [];
      if (cardInstance.inventoryItems) {
        cardInstance.inventoryItems.forEach(i => {
          if (i.category && i.category.trim() !== "" && !categoriesListArray.includes(i.category.trim())) {
            categoriesListArray.push(i.category.trim());
          }
        });
      }

      addPopupContainer.innerHTML = getAddPopupHtml(lang, categoriesListArray, { todoLists: todoListsArray });
      const shadow = cardInstance.shadowRoot;
      
      if (cardInstance._scannedBarcodeCache) {
        const bInput = shadow.getElementById("new_barcode"); if (bInput) bInput.value = cardInstance._scannedBarcodeCache;
        if (cardInstance._scannedDataCache) {
          const nInput = shadow.getElementById("new-name"); if (nInput && cardInstance._scannedDataCache.name) nInput.value = cardInstance._scannedDataCache.name;
          const cSelect = shadow.getElementById("new_cat_select");
          if (cSelect && cardInstance._scannedDataCache.category) {
            let exists = Array.from(cSelect.options).some(o => o.value === cardInstance._scannedDataCache.category);
            if (exists) { cSelect.value = cardInstance._scannedDataCache.category; cSelect.className = ""; }
            else { cSelect.value = "__NEW_CAT__"; cSelect.className = ""; const cCont = shadow.getElementById("new_cat_custom_container"); const cCust = shadow.getElementById("new_cat_custom"); if (cCont && cCust) { cCont.style.display = "block"; cCust.value = cardInstance._scannedDataCache.category; } }
          }
          const uInput = shadow.getElementById("new_unit"); if (uInput && cardInstance._scannedDataCache.unit) uInput.value = cardInstance._scannedDataCache.unit;
        }
        cardInstance._scannedBarcodeCache = null; cardInstance._scannedDataCache = null;
      }

      const qtyInput = shadow.getElementById("new-qty");
      const incBtn = shadow.getElementById("add-qty-inc");
      const decBtn = shadow.getElementById("add-qty-dec");
      if (qtyInput && incBtn && decBtn) {
        incBtn.addEventListener("click", () => { qtyInput.value = (parseFloat(qtyInput.value) || 0) + 1; });
        decBtn.addEventListener("click", () => { const cur = parseFloat(qtyInput.value) || 0; if (cur > 0) qtyInput.value = cur - 1; });
      }
      const catSelect = shadow.getElementById("new_cat_select");
      const catCustomContainer = shadow.getElementById("new_cat_custom_container");
      const catCustomInput = shadow.getElementById("new_cat_custom");
      if (catSelect && catCustomContainer && catCustomInput) {
        catSelect.addEventListener("change", (e) => { if (e.target.value === "__NEW_CAT__") { catCustomContainer.style.display = "block"; catCustomInput.value = ""; catCustomInput.focus(); } else { catCustomContainer.style.display = "none"; } });
      }
      const autoAddCheckbox = shadow.getElementById("new_auto_add_checkbox");
      const subRow = shadow.getElementById("new_auto_add_subrow");
      if (autoAddCheckbox && subRow) {
        const subInputs = subRow.querySelectorAll("input, select");
        autoAddCheckbox.addEventListener("change", (e) => { const isChecked = e.target.checked; subRow.style.opacity = isChecked ? "1" : "0.5"; subInputs.forEach(input => { if (isChecked) input.removeAttribute("disabled"); else input.setAttribute("disabled", "true"); }); });
      }

      const addButtons = addPopupContainer.querySelectorAll(".btn-save-add, .btn-add, #btn-add-save");
      addButtons.forEach(btn => { btn.addEventListener("click", () => handleAddItemService(cardInstance)); });
      const cancelButtons = addPopupContainer.querySelectorAll(".btn-cancel-add, .btn-cancel, #btn-add-cancel");
      cancelButtons.forEach(btn => { btn.addEventListener("click", () => { cardInstance._showAddPopup = false; cardInstance.updateCard(); }); });
    }
  }
}