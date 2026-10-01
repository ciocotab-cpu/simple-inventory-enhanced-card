import { getEditFormHtml } from './simple-inventory-templates.js';

/**
 * Funzione principale usata per smistare il rendering in base al layout configurato
 */
export function renderSingleItemCard(item, cardInstance, lang, categoriesListArray) {
  const layout = (cardInstance && cardInstance.config && cardInstance.config.card_layout) ? cardInstance.config.card_layout : 'layout1';

  switch (layout) {
    case 'layout2':
      return renderLayout2(item, cardInstance, lang, categoriesListArray);
    case 'layout3':
      return renderLayout3(item, cardInstance, lang, categoriesListArray);
    case 'layout4':
      return renderLayout4(item, cardInstance, lang, categoriesListArray);
    case 'layout1':
    default:
      return renderLayout1(item, cardInstance, lang, categoriesListArray);
  }
}

/**
 * LAYOUT 1: Codice e struttura originali senza alcuna modifica
 */
export function renderLayout1(item, cardInstance, lang, categoriesListArray) {
  const currentQty = item.quantity !== undefined ? item.quantity : 0;
  let customBg = "var(--secondary-background-color)", customBorder = "transparent";
  let expiryText = "", expiryBg = "transparent", expiryBorder = "transparent", expiryTextColor = "#fff";

  // Configurazione visibilità campi
  const showName = cardInstance.config.show_item_name !== false;
  const showUnit = cardInstance.config.show_item_unit !== false;
  const showExpiry = cardInstance.config.show_item_expiry !== false;
  const showCategory = cardInstance.config.show_item_category !== false;
  const showLocation = cardInstance.config.show_item_location !== false;

  const getRgbaColor = (hex, pct) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "transparent";
    const percentInt = pct !== undefined ? parseInt(pct) : 0;
    const alpha = Math.min(Math.max((100 - percentInt) / 100, 0), 1);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const days10d = cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;

  const qty0Val = cardInstance.config.qty_0 !== undefined ? cardInstance.config.qty_0 : 0;
  const qty1Val = cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qty3Val = cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

  if (item.expiry_date && currentQty > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const daysPast = Math.floor((today - expiry) / (1000 * 60 * 60 * 24));

    if (daysToExpiry < 0) {
      expiryBg = getRgbaColor(cardInstance.config.color_expired, cardInstance.config.alpha_expired) || "#db4437";
      expiryTextColor = "#ffffff";
      expiryBorder = getRgbaColor(cardInstance.config.color_expired, 50);
      expiryText = daysPast === 0 ? lang.scaduto_oggi : lang.scaduto_da_giorni.replace("{days}", daysPast);
    } else {
      let formattedLocaleDate = item.expiry_date;
      if (item.expiry_date.includes("-")) {
        const parts = item.expiry_date.split("-");
        if (parts.length === 3) formattedLocaleDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
      if (daysToExpiry <= days10d) { 
        expiryBg = getRgbaColor(cardInstance.config.color_10d, cardInstance.config.alpha_10d) || "#e6a23c";
        expiryTextColor = "#ffffff";
        expiryBorder = getRgbaColor(cardInstance.config.color_10d, 50);
      } else if (daysToExpiry <= days30d) { 
        expiryBg = getRgbaColor(cardInstance.config.color_30d, cardInstance.config.alpha_30d) || "#ffeb3b";
        expiryTextColor = "#212121";
        expiryBorder = getRgbaColor(cardInstance.config.color_30d, 50);
      }
    }
  }

  if (currentQty === qty0Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty0, cardInstance.config.alpha_qty0);
    customBorder = getRgbaColor(cardInstance.config.color_qty0, 50);
  } else if (currentQty > qty0Val && currentQty < qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty1, cardInstance.config.alpha_qty1);
    customBorder = getRgbaColor(cardInstance.config.color_qty1, 50);
  } else if (currentQty >= qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty3, cardInstance.config.alpha_qty3);
    customBorder = getRgbaColor(cardInstance.config.color_qty3, 50);
  }

  // Nome e Unità di misura condizionali
  let displayName = showName ? (item.name || lang.senza_nome) : "";
  if (showUnit && item.unit) {
    displayName = displayName ? `${displayName} (${item.unit})` : `(${item.unit})`;
  }

  // Categoria e Posizione condizionali
  let categoryHtml = "";
  const hasCat = showCategory && item.category && item.category.trim() !== "";
  const hasLoc = showLocation && item.location && item.location.trim() !== "";

  if (hasCat && hasLoc) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: right;">${item.category}, ${item.location}</span>`;
  } else if (hasCat) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: right;">${item.category}</span>`;
  } else if (hasLoc) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: right;">${item.location}</span>`;
  }

  // Scadenza condizionale
  const expiryHtml = (showExpiry && expiryText) ? `<div class="item-meta" style="background-color: ${expiryBg} !important; color: ${expiryTextColor} !important; border: 1px solid ${expiryBorder}; padding: 2px 6px; border-radius: 4px; display: inline-block; width: max-content; max-width: 100%; box-sizing: border-box; white-space: nowrap;">${expiryText}</div>` : '';
  const isEditing = cardInstance._editingItemId === item.id;
  const centerDisplay = currentQty === 0 ? `<button class="btn-delete" data-name="${item.name}" style="background:transparent; border:none; padding:0; height:26px; width:26px; cursor:pointer;"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>` : `<span class="qty-display">${currentQty}</span>`;

  // Estrazione delle liste To-Do dallo stato globale per formattare la modale in modifica
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

  const editFormHtml = isEditing ? getEditFormHtml(item, lang, { categories: categoriesListArray, todoLists: todoListsArray }) : "";

  // Gestione icona To-Do (cart-plus)
  let autoAddHtml = "";
  if (item.auto_add_id_to_description_enabled) {
    let todoName = item.todo_list || "";
    if (todoName) {
      const match = todoListsArray.find(t => t.entity_id === todoName);
      if (match) todoName = match.name;
    }
    const minQty = item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : "";
    const tooltipText = (lang.auto_add_tooltip || "{todo} quando {min_qty} oggetti rimanenti")
      .replace("{todo}", todoName)
      .replace("{min_qty}", minQty);

    autoAddHtml = `<span class="auto-add-icon" title="${tooltipText}"><ha-icon icon="mdi:cart-plus"></ha-icon></span>`;
  }

  return `
    <div class="item-card" style="background-color: ${customBg} !important; border: 1px solid ${customBorder};">
      ${!isEditing ? `
        <div class="card-top-right-actions">
          ${autoAddHtml}
          <button class="edit-icon-btn" data-id="${item.id}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>
        </div>
      ` : ''}
      <div style="display: flex; flex-direction: column; min-width: 0; width: 100%;">
        <div class="item-name" style="padding-right: 44px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
        <div style="display: flex; align-items: center; width: 100%; margin-top: 4px; overflow: hidden;">${expiryHtml}${categoryHtml}</div>
      </div>
      ${!isEditing ? `<div class="item-actions"><button class="btn-dec" data-name="${item.name}">-</button>${centerDisplay}<button class="btn-inc" data-name="${item.name}">+</button></div>` : ''}
      ${editFormHtml}
    </div>
  `;
}

/**
 * LAYOUT 2: Default invertito
 */
export function renderLayout2(item, cardInstance, lang, categoriesListArray) {
  const currentQty = item.quantity !== undefined ? item.quantity : 0;
  let customBg = "var(--secondary-background-color)", customBorder = "transparent";
  let expiryText = "", expiryBg = "transparent", expiryBorder = "transparent", expiryTextColor = "#fff";

  // Configurazione visibilità campi
  const showName = cardInstance.config.show_item_name !== false;
  const showUnit = cardInstance.config.show_item_unit !== false;
  const showExpiry = cardInstance.config.show_item_expiry !== false;
  const showCategory = cardInstance.config.show_item_category !== false;
  const showLocation = cardInstance.config.show_item_location !== false;

  const getRgbaColor = (hex, pct) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "transparent";
    const percentInt = pct !== undefined ? parseInt(pct) : 0;
    const alpha = Math.min(Math.max((100 - percentInt) / 100, 0), 1);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const days10d = cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;

  const qty0Val = cardInstance.config.qty_0 !== undefined ? cardInstance.config.qty_0 : 0;
  const qty1Val = cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qty3Val = cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

  if (item.expiry_date && currentQty > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const daysPast = Math.floor((today - expiry) / (1000 * 60 * 60 * 24));

    if (daysToExpiry < 0) {
      expiryBg = getRgbaColor(cardInstance.config.color_expired, cardInstance.config.alpha_expired) || "#db4437";
      expiryTextColor = "#ffffff";
      expiryBorder = getRgbaColor(cardInstance.config.color_expired, 50);
      expiryText = daysPast === 0 ? lang.scaduto_oggi : lang.scaduto_da_giorni.replace("{days}", daysPast);
    } else {
      let formattedLocaleDate = item.expiry_date;
      if (item.expiry_date.includes("-")) {
        const parts = item.expiry_date.split("-");
        if (parts.length === 3) formattedLocaleDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
      if (daysToExpiry <= days10d) { 
        expiryBg = getRgbaColor(cardInstance.config.color_10d, cardInstance.config.alpha_10d) || "#e6a23c";
        expiryTextColor = "#ffffff";
        expiryBorder = getRgbaColor(cardInstance.config.color_10d, 50);
      } else if (daysToExpiry <= days30d) { 
        expiryBg = getRgbaColor(cardInstance.config.color_30d, cardInstance.config.alpha_30d) || "#ffeb3b";
        expiryTextColor = "#212121";
        expiryBorder = getRgbaColor(cardInstance.config.color_30d, 50);
      }
    }
  }

  if (currentQty === qty0Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty0, cardInstance.config.alpha_qty0);
    customBorder = getRgbaColor(cardInstance.config.color_qty0, 50);
  } else if (currentQty > qty0Val && currentQty < qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty1, cardInstance.config.alpha_qty1);
    customBorder = getRgbaColor(cardInstance.config.color_qty1, 50);
  } else if (currentQty >= qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty3, cardInstance.config.alpha_qty3);
    customBorder = getRgbaColor(cardInstance.config.color_qty3, 50);
  }

  // Nome e Unità di misura condizionali
  let displayName = showName ? (item.name || lang.senza_nome) : "";
  if (showUnit && item.unit) {
    displayName = displayName ? `${displayName} (${item.unit})` : `(${item.unit})`;
  }

  // Categoria e Posizione condizionali (Allineate a SINISTRA)
  let categoryHtml = "";
  const hasCat = showCategory && item.category && item.category.trim() !== "";
  const hasLoc = showLocation && item.location && item.location.trim() !== "";

  if (hasCat && hasLoc) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: left;">${item.category}, ${item.location}</span>`;
  } else if (hasCat) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: left;">${item.category}</span>`;
  } else if (hasLoc) {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: left;">${item.location}</span>`;
  }

  // Scadenza condizionale (Allineata a DESTRA con margin-left: auto se categoryHtml non è presente)
  const expiryHtml = (showExpiry && expiryText) ? `<div class="item-meta" style="background-color: ${expiryBg} !important; color: ${expiryTextColor} !important; border: 1px solid ${expiryBorder}; padding: 2px 6px; border-radius: 4px; display: inline-block; width: max-content; max-width: 50%; box-sizing: border-box; white-space: nowrap; text-align: right; margin-left: auto;">${expiryText}</div>` : '';
  const isEditing = cardInstance._editingItemId === item.id;
  const centerDisplay = currentQty === 0 ? `<button class="btn-delete" data-name="${item.name}" style="background:transparent; border:none; padding:0; height:26px; width:26px; cursor:pointer;"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>` : `<span class="qty-display">${currentQty}</span>`;

  // Estrazione delle liste To-Do dallo stato globale per formattare la modale in modifica
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

  const editFormHtml = isEditing ? getEditFormHtml(item, lang, { categories: categoriesListArray, todoLists: todoListsArray }) : "";

  // Gestione icona To-Do (cart-plus)
  let autoAddHtml = "";
  if (item.auto_add_id_to_description_enabled) {
    let todoName = item.todo_list || "";
    if (todoName) {
      const match = todoListsArray.find(t => t.entity_id === todoName);
      if (match) todoName = match.name;
    }
    const minQty = item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : "";
    const tooltipText = (lang.auto_add_tooltip || "{todo} quando {min_qty} oggetti rimanenti")
      .replace("{todo}", todoName)
      .replace("{min_qty}", minQty);

    autoAddHtml = `<span class="auto-add-icon" title="${tooltipText}"><ha-icon icon="mdi:cart-plus"></ha-icon></span>`;
  }

  return `
    <div class="item-card" style="background-color: ${customBg} !important; border: 1px solid ${customBorder};">
      ${!isEditing ? `
        <div class="card-top-right-actions">
          ${autoAddHtml}
          <button class="edit-icon-btn" data-id="${item.id}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>
        </div>
      ` : ''}
      <div style="display: flex; flex-direction: column; min-width: 0; width: 100%;">
        <div class="item-name" style="padding-right: 44px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
        <!-- Contenitore riga 2: justify-content: space-between distribuisce gli elementi agli opposti -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 4px; overflow: hidden; gap: 8px;">${categoryHtml}${expiryHtml}</div>
      </div>
      ${!isEditing ? `<div class="item-actions"><button class="btn-dec" data-name="${item.name}">-</button>${centerDisplay}<button class="btn-inc" data-name="${item.name}">+</button></div>` : ''}
      ${editFormHtml}
    </div>
  `;
}

/**
 * LAYOUT 3: Layout a 2 righe
 */
export function renderLayout3(item, cardInstance, lang, categoriesListArray) {
  const currentQty = item.quantity !== undefined ? item.quantity : 0;
  let customBg = "var(--secondary-background-color)", customBorder = "transparent";

  // Configurazione visibilità campi
  const showName = cardInstance.config.show_item_name !== false;
  const showUnit = cardInstance.config.show_item_unit !== false;
  const showExpiry = cardInstance.config.show_item_expiry !== false;
  const showCategory = cardInstance.config.show_item_category !== false;
  const showLocation = cardInstance.config.show_item_location !== false;

  const getRgbaColor = (hex, pct) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "transparent";
    const percentInt = pct !== undefined ? parseInt(pct) : 0;
    const alpha = Math.min(Math.max((100 - percentInt) / 100, 0), 1);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const days10d = cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;

  const qty0Val = cardInstance.config.qty_0 !== undefined ? cardInstance.config.qty_0 : 0;
  const qty1Val = cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qty3Val = cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

  // Gestione dinamica Scadenza: Icona, Colore e Tooltip
  let calendarIcon = "mdi:calendar-check";
  let calendarColor = "var(--secondary-text-color)";
  let expiryText = "";

  if (item.expiry_date && currentQty > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const daysPast = Math.floor((today - expiry) / (1000 * 60 * 60 * 24));

    let formattedLocaleDate = item.expiry_date;
    if (item.expiry_date.includes("-")) {
      const parts = item.expiry_date.split("-");
      if (parts.length === 3) formattedLocaleDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    if (daysToExpiry < 0) {
      calendarIcon = "mdi:calendar-remove";
      calendarColor = getRgbaColor(cardInstance.config.color_expired, cardInstance.config.alpha_expired) || "#db4437";
      expiryText = daysPast === 0 ? lang.scaduto_oggi : lang.scaduto_da_giorni.replace("{days}", daysPast);
    } else if (daysToExpiry <= days10d) {
      calendarIcon = "mdi:calendar-alert-outline";
      calendarColor = getRgbaColor(cardInstance.config.color_10d, cardInstance.config.alpha_10d) || "#e6a23c";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    } else if (daysToExpiry <= days30d) {
      calendarIcon = "mdi:calendar-alert-outline";
      calendarColor = getRgbaColor(cardInstance.config.color_30d, cardInstance.config.alpha_30d) || "#ffeb3b";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    } else {
      calendarIcon = "mdi:calendar-check";
      calendarColor = "var(--secondary-text-color)";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    }
  }

  // Sfondi in base alla Quantità
  if (currentQty === qty0Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty0, cardInstance.config.alpha_qty0);
    customBorder = getRgbaColor(cardInstance.config.color_qty0, 50);
  } else if (currentQty > qty0Val && currentQty < qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty1, cardInstance.config.alpha_qty1);
    customBorder = getRgbaColor(cardInstance.config.color_qty1, 50);
  } else if (currentQty >= qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty3, cardInstance.config.alpha_qty3);
    customBorder = getRgbaColor(cardInstance.config.color_qty3, 50);
  }

  // Nome e Unità di misura
  let displayName = showName ? (item.name || lang.senza_nome) : "";
  if (showUnit && item.unit) {
    displayName = displayName ? `${displayName} (${item.unit})` : `(${item.unit})`;
  }

  // Categoria e Posizione (Destra Riga 2)
  let catLocText = "";
  const hasCat = showCategory && item.category && item.category.trim() !== "";
  const hasLoc = showLocation && item.location && item.location.trim() !== "";

  if (hasCat && hasLoc) catLocText = `${item.category}, ${item.location}`;
  else if (hasCat) catLocText = item.category;
  else if (hasLoc) catLocText = item.location;

  const categoryHtml = catLocText ? `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; max-width: 100%;">${catLocText}</span>` : '';

  const isEditing = cardInstance._editingItemId === item.id;
  const centerDisplay = currentQty === 0 
    ? `<button class="btn-delete" data-name="${item.name}" style="background:transparent; border:none; padding:0; height:26px; width:26px; cursor:pointer;"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>` 
    : `<span class="qty-display">${currentQty}</span>`;

  // Liste To-Do per Modale Modifica
  const todoListsArray = [];
  if (cardInstance._hass && cardInstance._hass.states) {
    Object.keys(cardInstance._hass.states).forEach(entityId => {
      if (entityId.startsWith("todo.")) {
        const stateObj = cardInstance._hass.states[entityId];
        const friendlyName = (stateObj.attributes && stateObj.attributes.friendly_name) ? stateObj.attributes.friendly_name : entityId;
        todoListsArray.push({ entity_id: entityId, name: friendlyName });
      }
    });
  }
  todoListsArray.sort((a, b) => a.name.localeCompare(b.name));

  const editFormHtml = isEditing ? getEditFormHtml(item, lang, { categories: categoriesListArray, todoLists: todoListsArray }) : "";

  // Gestione Icona To-Do (Carrello)
  let autoAddHtml = "";
  if (item.auto_add_id_to_description_enabled) {
    let todoName = item.todo_list || "";
    if (todoName) {
      const match = todoListsArray.find(t => t.entity_id === todoName);
      if (match) todoName = match.name;
    }
    const minQty = item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : "";
    const tooltipText = (lang.auto_add_tooltip || "{todo} quando {min_qty} oggetti rimanenti")
      .replace("{todo}", todoName)
      .replace("{min_qty}", minQty);

    autoAddHtml = `<span class="auto-add-icon" title="${tooltipText}" style="display: inline-flex; align-items: center;"><ha-icon icon="mdi:cart-plus"></ha-icon></span>`;
  }

  // Icona Calendario condizionale
  const calendarHtml = (showExpiry && item.expiry_date) 
    ? `<span title="${expiryText}" style="color: ${calendarColor}; display: inline-flex; align-items: center;"><ha-icon icon="${calendarIcon}"></ha-icon></span>` 
    : '';

  return `
    <div class="item-card layout-3" style="background-color: ${customBg} !important; border: 1px solid ${customBorder}; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
      
      <!-- RIGA 1: Nome (sinistra) | Quantità (destra) -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px;">
        <div class="item-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-weight: bold;">${displayName}</div>
        
        ${!isEditing ? `
          <div class="item-actions" style="margin: 0; display: flex; align-items: center; gap: 4px;">
            <button class="btn-dec" data-name="${item.name}">-</button>
            ${centerDisplay}
            <button class="btn-inc" data-name="${item.name}">+</button>
          </div>
        ` : ''}
      </div>

      <!-- RIGA 2: Icone (sinistra) | Categoria e Posizione (destra) -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px; min-height: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${calendarHtml}
          ${autoAddHtml}
          ${!isEditing ? `<button class="edit-icon-btn" data-id="${item.id}" style="background: transparent; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; color: var(--secondary-text-color);"><ha-icon icon="mdi:cog-outline"></ha-icon></button>` : ''}
        </div>
        
        <div style="display: flex; align-items: center; overflow: hidden; justify-content: flex-end; flex: 1;">
          ${categoryHtml}
        </div>
      </div>

      ${editFormHtml}
    </div>
  `;
}

/**
 * Placeholder per Layout 4
 */
export function renderLayout4(item, cardInstance, lang, categoriesListArray) {
  const currentQty = item.quantity !== undefined ? item.quantity : 0;
  let customBg = "var(--secondary-background-color)", customBorder = "transparent";

  // Configurazione visibilità campi
  const showName = cardInstance.config.show_item_name !== false;
  const showUnit = cardInstance.config.show_item_unit !== false;
  const showExpiry = cardInstance.config.show_item_expiry !== false;
  const showCategory = cardInstance.config.show_item_category !== false;
  const showLocation = cardInstance.config.show_item_location !== false;

  const getRgbaColor = (hex, pct) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "transparent";
    const percentInt = pct !== undefined ? parseInt(pct) : 0;
    const alpha = Math.min(Math.max((100 - percentInt) / 100, 0), 1);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const days10d = cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;

  const qty0Val = cardInstance.config.qty_0 !== undefined ? cardInstance.config.qty_0 : 0;
  const qty1Val = cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qty3Val = cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

  // Gestione dinamica Scadenza: Icona, Colore e Tooltip
  let calendarIcon = "mdi:calendar-check";
  let calendarColor = "var(--secondary-text-color)";
  let expiryText = "";

  if (item.expiry_date && currentQty > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const daysPast = Math.floor((today - expiry) / (1000 * 60 * 60 * 24));

    let formattedLocaleDate = item.expiry_date;
    if (item.expiry_date.includes("-")) {
      const parts = item.expiry_date.split("-");
      if (parts.length === 3) formattedLocaleDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    if (daysToExpiry < 0) {
      calendarIcon = "mdi:calendar-remove";
      calendarColor = getRgbaColor(cardInstance.config.color_expired, cardInstance.config.alpha_expired) || "#db4437";
      expiryText = daysPast === 0 ? lang.scaduto_oggi : lang.scaduto_da_giorni.replace("{days}", daysPast);
    } else if (daysToExpiry <= days10d) {
      calendarIcon = "mdi:calendar-alert-outline";
      calendarColor = getRgbaColor(cardInstance.config.color_10d, cardInstance.config.alpha_10d) || "#e6a23c";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    } else if (daysToExpiry <= days30d) {
      calendarIcon = "mdi:calendar-alert-outline";
      calendarColor = getRgbaColor(cardInstance.config.color_30d, cardInstance.config.alpha_30d) || "#ffeb3b";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    } else {
      calendarIcon = "mdi:calendar-check";
      calendarColor = "var(--secondary-text-color)";
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
    }
  }

  // Sfondi in base alla Quantità
  if (currentQty === qty0Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty0, cardInstance.config.alpha_qty0);
    customBorder = getRgbaColor(cardInstance.config.color_qty0, 50);
  } else if (currentQty > qty0Val && currentQty < qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty1, cardInstance.config.alpha_qty1);
    customBorder = getRgbaColor(cardInstance.config.color_qty1, 50);
  } else if (currentQty >= qty3Val) {
    customBg = getRgbaColor(cardInstance.config.color_qty3, cardInstance.config.alpha_qty3);
    customBorder = getRgbaColor(cardInstance.config.color_qty3, 50);
  }

  // Nome e Unità di misura
  let displayName = showName ? (item.name || lang.senza_nome) : "";
  if (showUnit && item.unit) {
    displayName = displayName ? `${displayName} (${item.unit})` : `(${item.unit})`;
  }

  // Categoria e Posizione (Destra Riga 2)
  let catLocText = "";
  const hasCat = showCategory && item.category && item.category.trim() !== "";
  const hasLoc = showLocation && item.location && item.location.trim() !== "";

  if (hasCat && hasLoc) catLocText = `${item.category}, ${item.location}`;
  else if (hasCat) catLocText = item.category;
  else if (hasLoc) catLocText = item.location;

  const categoryHtml = catLocText ? `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; max-width: 100%;">${catLocText}</span>` : '';

  const isEditing = cardInstance._editingItemId === item.id;
  const centerDisplay = currentQty === 0 
    ? `<button class="btn-delete" data-name="${item.name}" style="background:transparent; border:none; padding:0; height:26px; width:26px; cursor:pointer;"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>` 
    : `<span class="qty-display">${currentQty}</span>`;

  // Liste To-Do per Modale Modifica
  const todoListsArray = [];
  if (cardInstance._hass && cardInstance._hass.states) {
    Object.keys(cardInstance._hass.states).forEach(entityId => {
      if (entityId.startsWith("todo.")) {
        const stateObj = cardInstance._hass.states[entityId];
        const friendlyName = (stateObj.attributes && stateObj.attributes.friendly_name) ? stateObj.attributes.friendly_name : entityId;
        todoListsArray.push({ entity_id: entityId, name: friendlyName });
      }
    });
  }
  todoListsArray.sort((a, b) => a.name.localeCompare(b.name));

  const editFormHtml = isEditing ? getEditFormHtml(item, lang, { categories: categoriesListArray, todoLists: todoListsArray }) : "";

  // Gestione Icona To-Do (Carrello)
  let autoAddHtml = "";
  if (item.auto_add_id_to_description_enabled) {
    let todoName = item.todo_list || "";
    if (todoName) {
      const match = todoListsArray.find(t => t.entity_id === todoName);
      if (match) todoName = match.name;
    }
    const minQty = item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : "";
    const tooltipText = (lang.auto_add_tooltip || "{todo} quando {min_qty} oggetti rimanenti")
      .replace("{todo}", todoName)
      .replace("{min_qty}", minQty);

    autoAddHtml = `<span class="auto-add-icon" title="${tooltipText}" style="display: inline-flex; align-items: center;"><ha-icon icon="mdi:cart-plus"></ha-icon></span>`;
  }

  // Icona Calendario condizionale
  const calendarHtml = (showExpiry && item.expiry_date) 
    ? `<span title="${expiryText}" style="color: ${calendarColor}; display: inline-flex; align-items: center;"><ha-icon icon="${calendarIcon}"></ha-icon></span>` 
    : '';

  return `
    <div class="item-card layout-4" style="background-color: ${customBg} !important; border: 1px solid ${customBorder}; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
      
      <!-- RIGA 1: Nome (sinistra) | Quantità (destra) -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px;">
        <div class="item-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-weight: bold;">${displayName}</div>
        
        ${!isEditing ? `
          <div class="item-actions" style="margin: 0; display: flex; align-items: center; gap: 4px;">
            <button class="btn-dec" data-name="${item.name}">-</button>
            ${centerDisplay}
            <button class="btn-inc" data-name="${item.name}">+</button>
          </div>
        ` : ''}
      </div>

      <!-- RIGA 2: Icone (destra) | Categoria e Posizione (sinistra) -->
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px; min-height: 24px;">
        <div style="display: flex; align-items: left; overflow: hidden; justify-content: flex-start; flex: 1;">
          ${categoryHtml}
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          ${calendarHtml}
          ${autoAddHtml}
          ${!isEditing ? `<button class="edit-icon-btn" data-id="${item.id}" style="background: transparent; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; color: var(--secondary-text-color);"><ha-icon icon="mdi:cog-outline"></ha-icon></button>` : ''}
        </div>
      </div>

      ${editFormHtml}
    </div>
  `;
}
