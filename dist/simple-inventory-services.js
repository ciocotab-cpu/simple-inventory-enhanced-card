export async function handleSaveEditService(cardInstance, itemId, oldName) {
  const shadow = cardInstance.shadowRoot;
  if (!shadow) return;

  const stateObj = cardInstance._hass.states[cardInstance.config.entity];
  if (!stateObj || !stateObj.attributes) return;

  const inventoryId = stateObj.attributes.inventory_id;
  if (!inventoryId) return;

  const nameEl = shadow.getElementById("edit_name");
  const qtyEl = shadow.getElementById("edit_qty");
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
    alert("Il nome del prodotto non può essere vuoto.");
    return;
  }

  let finalCategory = "";
  if (catSelectEl) {
    if (catSelectEl.value === "__NEW_CAT__" && catCustomEl) {
      finalCategory = catCustomEl.value.trim();
    } else {
      finalCategory = catSelectEl.value.trim();
    }
  }

  const isAutoAddChecked = autoAddCheckbox ? autoAddCheckbox.checked : false;

  const serviceData = {
    inventory_id: inventoryId,
    old_name: oldName,
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
    await cardInstance._hass.callService("simple_inventory", "update_item", serviceData);
    cardInstance._editingItemId = null;
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante l'aggiornamento del prodotto:", err);
    alert("Impossibile salvare le modifiche.\nErrore Backend: " + err.message);
  }
}

export async function handleAddItemService(cardInstance) {
  const shadow = cardInstance.shadowRoot;
  if (!shadow) return;

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
  const name = nameEl.value.trim();

  if (!name) {
    alert("Il nome del prodotto non può essere vuoto.");
    return;
  }

  let finalCategory = "";
  if (catSelectEl) {
    if (catSelectEl.value === "__NEW_CAT__" && catCustomEl) {
      finalCategory = catCustomEl.value.trim();
    } else {
      finalCategory = catSelectEl.value.trim();
    }
  }

  const isAutoAddChecked = autoAddCheckbox ? autoAddCheckbox.checked : false;

  const serviceData = {
    inventory_id: inventoryId,
    name: name,
    desired_quantity: qtyEl ? parseFloat(qtyEl.value) || 0 : 0,
    auto_add_id_to_description_enabled: isAutoAddChecked
  };

  if (finalCategory !== "") serviceData.category = finalCategory;
  if (expiryEl && expiryEl.value.trim() !== "") serviceData.expiry_date = expiryEl.value.trim();
  if (expAlertEl && expAlertEl.value.trim() !== "") serviceData.expiry_alert_days = parseInt(expAlertEl.value) || 0;
  if (unitEl && unitEl.value.trim() !== "") serviceData.unit = unitEl.value.trim();
  if (locEl && locEl.value.trim() !== "") serviceData.location = locEl.value.trim();
  if (aliasesEl && aliasesEl.value.trim() !== "") serviceData.aliases = aliasesEl.value.trim();
  if (descEl && descEl.value.trim() !== "") serviceData.description = descEl.value.trim();
  if (barcodeEl && barcodeEl.value.trim() !== "") serviceData.barcode = barcodeEl.value.trim();
  
  if (isAutoAddChecked) {
    if (todoEl && todoEl.value !== "") serviceData.todo_list = todoEl.value;
    if (todoPlaceEl && todoPlaceEl.value) serviceData.todo_quantity_placement = todoPlaceEl.value;
    if (minQtyEl && minQtyEl.value.trim() !== "") serviceData.auto_add_to_list_quantity = parseInt(minQtyEl.value) || 2;
  }

  if (priceEl && priceEl.value.trim() !== "") {
    const parsedPrice = parseFloat(priceEl.value);
    if (!isNaN(parsedPrice)) serviceData.price = parsedPrice;
  }

  try {
    await cardInstance._hass.callService("simple_inventory", "add_item", serviceData);
    cardInstance._showAddPopup = false;
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante l'aggiunta del prodotto:", err);
    alert("Impossibile aggiungere l'articolo.\nErrore Backend: " + err.message);
  }
}


export async function deleteItemDefinitivelyService(cardInstance, itemName) {
  if (!cardInstance.config || !cardInstance.config.entity) return;
  const stateObj = cardInstance._hass.states[cardInstance.config.entity];
  if (!stateObj || !stateObj.attributes) return;
  const inventoryId = stateObj.attributes.inventory_id;
  if (!inventoryId) return;

  if (!confirm(`Vuoi eliminare definitivamente '${itemName}' dall'inventario?`)) return;

  try {
    await cardInstance._hass.callService("simple_inventory", "remove_item", {
      inventory_id: inventoryId,
      name: itemName
    });
    cardInstance._editingItemId = null;
    cardInstance._initialFetched = false;
    cardInstance.fetchInventoryItems();
  } catch (err) {
    console.error("Errore durante l'eliminazione del prodotto:", err);
    alert("Impossibile eliminare l'articolo.\nErrore Backend: " + err.message);
  }
}

