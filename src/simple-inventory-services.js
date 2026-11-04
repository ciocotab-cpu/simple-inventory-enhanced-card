import { getTranslation } from './simple-inventory-lang.js';

export async function handleSaveEditService(cardInstance, itemId) {
  const shadow = cardInstance.shadowRoot;
  if (!shadow) return;

  const lang = getTranslation(cardInstance._hass);

  const stateObj = cardInstance._hass.states[cardInstance.config.entity];
  if (!stateObj || !stateObj.attributes) return;

  const inventoryId = stateObj.attributes.inventory_id;
  if (!inventoryId) return;

  const nameEl = shadow.getElementById("edit_name");
  const qtyEl = shadow.getElementById("edit-qty");
  const expiryEl = shadow.getElementById("edit_expiry");
  const expAlertEl = shadow.getElementById("edit_exp_alert");
  const unitEl = shadow.getElementById("edit_unit");
  const catSelectEl = shadow.getElementById("edit_cat_select");
  const catCustomEl = shadow.getElementById("edit_cat_custom");
  const locEl = shadow.getElementById("edit_loc");
  const priceEl = shadow.getElementById("edit_price");
  const barcodeEl = shadow.getElementById("edit_barcode");
  const aliasesEl = shadow.getElementById("edit_aliases");
  const todoEl = shadow.getElementById("edit_todo");
  const todoPlaceEl = shadow.getElementById("edit_todo_placement");
  const autoAddCheckbox = shadow.getElementById("edit_auto_add_checkbox");
  const minQtyEl = shadow.getElementById("edit_min_qty");
  const descEl = shadow.getElementById("edit_desc");

  if (!nameEl) return;
  const newName = nameEl.value.trim();

  if (!newName) {
    alert(lang.error_empty_name || "Product name cannot be empty.");
    return;
  }

  const isAutoAddChecked = autoAddCheckbox ? autoAddCheckbox.checked : false;

  if (isAutoAddChecked) {
    const selectedTodo = todoEl ? todoEl.value.trim() : "";
    if (!selectedTodo) {
      alert(lang.error_select_todo || "Select a valid To-Do list for automatic addition.");
      return;
    }
  }

  let finalCategory = "";
  if (catSelectEl) {
    if (catSelectEl.value === "__NEW_CAT__" && catCustomEl) {
      finalCategory = catCustomEl.value.trim();
    } else {
      finalCategory = catSelectEl.value.trim();
    }
  }

  const serviceData = {
    inventory_id: inventoryId,
    item_id: itemId,
    name: newName,
    desired_quantity: qtyEl ? parseFloat(qtyEl.value) || 0 : 0,
    auto_add_id_to_description_enabled: isAutoAddChecked,
    expiry_date: expiryEl ? expiryEl.value.trim() : "",
    expiry_alert_days: expAlertEl ? parseInt(expAlertEl.value) || 0 : 0,
    unit: unitEl ? unitEl.value.trim() : "",
    category: finalCategory,
    location: locEl ? locEl.value.trim() : "",
    aliases: aliasesEl ? aliasesEl.value.trim() : "",
    description: descEl ? descEl.value.trim() : "",
    barcode: barcodeEl ? barcodeEl.value.trim() : ""
  };

  if (isAutoAddChecked) {
    if (todoEl) serviceData.todo_list = todoEl.value.trim();
    if (todoPlaceEl) serviceData.todo_quantity_placement = todoPlaceEl.value;
    if (minQtyEl) serviceData.auto_add_to_list_quantity = parseInt(minQtyEl.value) || 2;
  }

  if (priceEl && priceEl.value.trim() !== "") {
    const parsedPrice = parseFloat(priceEl.value);
    if (!isNaN(parsedPrice)) serviceData.price = parsedPrice;
  }

  try {
    await cardInstance._hass.callService("simple_inventory_enhanced", "update_item", serviceData);
    cardInstance._editingItemId = null;
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante l'aggiornamento del prodotto:", err);
    alert((lang.error_edit_fail || "Failed to save changes.\\nBackend Error: ") + err.message);
  }
}

export async function handleAddItemService(cardInstance) {
  const shadow = cardInstance.shadowRoot;
  if (!shadow) return;

  const lang = getTranslation(cardInstance._hass);

  const stateObj = cardInstance._hass.states[cardInstance.config.entity];
  if (!stateObj || !stateObj.attributes) return;

  const inventoryId = stateObj.attributes.inventory_id;
  if (!inventoryId) return;

  const nameEl = shadow.getElementById("new-name");
  const qtyEl = shadow.getElementById("new-qty");
  const expiryEl = shadow.getElementById("new_expiry");
  const expAlertEl = shadow.getElementById("new_exp_alert");
  const unitEl = shadow.getElementById("new_unit");
  const catSelectEl = shadow.getElementById("new_cat_select");
  const catCustomEl = shadow.getElementById("new_cat_custom");
  const locEl = shadow.getElementById("new_loc");
  const priceEl = shadow.getElementById("new_price");
  const barcodeEl = shadow.getElementById("new_barcode");
  const aliasesEl = shadow.getElementById("new_aliases");
  const todoEl = shadow.getElementById("new_todo");
  const todoPlaceEl = shadow.getElementById("new_todo_placement");
  const autoAddCheckbox = shadow.getElementById("new_auto_add_checkbox");
  const minQtyEl = shadow.getElementById("new_min_qty");
  const descEl = shadow.getElementById("new_desc");

  if (!nameEl) return;
  const baseName = nameEl.value.trim();

  if (!baseName) {
    alert(lang.error_empty_name || "Product name cannot be empty.");
    return;
  }

  const isAutoAddChecked = autoAddCheckbox ? autoAddCheckbox.checked : false;

  if (isAutoAddChecked) {
    const selectedTodo = todoEl ? todoEl.value.trim() : "";
    if (!selectedTodo) {
      alert(lang.error_select_todo || "Select a valid To-Do list for automatic addition.");
      return;
    }
  }

  let finalCategory = "";
  if (catSelectEl) {
    if (catSelectEl.value === "__NEW_CAT__" && catCustomEl) {
      finalCategory = catCustomEl.value.trim();
    } else {
      finalCategory = catSelectEl.value.trim();
    }
  }

  const inputQuantity = qtyEl ? parseFloat(qtyEl.value) || 0 : 0;
  const inputUnit = unitEl ? unitEl.value.trim().toLowerCase() : "";
  const inputExpiry = expiryEl ? expiryEl.value.trim() : "";

  // Recupera la lista degli articoli esistenti caricati nella card
  const existingItems = cardInstance._items || stateObj.attributes.items || [];

  // Filtra tutti gli articoli con lo stesso nome base
  const sameNameItems = existingItems.filter(item => {
    if (!item.name) return false;
    const itemName = item.name.trim().toLowerCase();
    return itemName === baseName.toLowerCase() || itemName.startsWith(baseName.toLowerCase() + " (");
  });

  // Il backend identifica gli articoli per nome durante l'aggiunta: genera un nome libero.
  let nameToSave = baseName;
  if (sameNameItems.length > 0) {
    const details = [];
    if (inputUnit) details.push(inputUnit);
    if (inputExpiry) details.push(inputExpiry);

    const namePrefix = details.length > 0
      ? `${baseName} (${details.join(" - ")})`
      : `${baseName} (2)`;
    nameToSave = namePrefix;
    const existingNames = new Set(existingItems.map(item => (item.name || "").trim().toLowerCase()));
    let suffix = 2;
    while (existingNames.has(nameToSave.toLowerCase())) {
      nameToSave = `${namePrefix} (${suffix})`;
      suffix += 1;
    }
  }

  // NUOVO PRODOTTO / PRODOTTO CON DETTAGLI DIVERSI: Chiama add_item
  const serviceData = {
    inventory_id: inventoryId,
    name: nameToSave,
    quantity: inputQuantity,
    auto_add_id_to_description_enabled: isAutoAddChecked,
    expiry_date: inputExpiry,
    expiry_alert_days: expAlertEl ? parseInt(expAlertEl.value) || 0 : 0,
    unit: inputUnit,
    category: finalCategory,
    location: locEl ? locEl.value.trim() : "",
    aliases: aliasesEl ? aliasesEl.value.trim() : "",
    description: descEl ? descEl.value.trim() : "",
    barcode: barcodeEl ? barcodeEl.value.trim() : ""
  };

  if (isAutoAddChecked) {
    if (todoEl) serviceData.todo_list = todoEl.value.trim();
    if (todoPlaceEl) serviceData.todo_quantity_placement = todoPlaceEl.value;
    if (minQtyEl) serviceData.auto_add_to_list_quantity = parseInt(minQtyEl.value) || 2;
  }

  if (priceEl && priceEl.value.trim() !== "") {
    const parsedPrice = parseFloat(priceEl.value);
    if (!isNaN(parsedPrice)) serviceData.price = parsedPrice;
  }

  try {
    await cardInstance._hass.callService("simple_inventory_enhanced", "add_item", serviceData);
    cardInstance._showAddPopup = false;
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante la creazione del nuovo prodotto:", err);
    alert((lang.error_add_fail || "Failed to add item.\\nBackend Error: ") + err.message);
  }
}

export async function deleteItemDefinitivelyService(cardInstance, itemId, itemName) {
  const lang = getTranslation(cardInstance._hass);
  if (!confirm((lang.confirm_delete || "Are you sure you want to permanently delete '{itemName}' from the inventory?").replace("{item}", itemName))) {
    return;
  }

  const stateObj = cardInstance._hass.states[cardInstance.config.entity];
  if (!stateObj || !stateObj.attributes) return;

  const inventoryId = stateObj.attributes.inventory_id;
  if (!inventoryId) return;

  try {
    await cardInstance._hass.callService("simple_inventory_enhanced", "remove_item", {
      inventory_id: inventoryId,
      item_id: itemId
    });
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante l'eliminazione dell'articolo:", err);
    alert((lang.error_delete_fail || "Failed to delete item.\\nBackend Error: ") + err.message);
  }
}