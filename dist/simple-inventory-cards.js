import { getEditFormHtml } from './simple-inventory-templates.js';

export function renderSingleItemCard(item, cardInstance, lang, categoriesListArray) {
  const currentQty = item.quantity !== undefined ? item.quantity : 0;
  let customBg = "var(--secondary-background-color)", customBorder = "transparent";
  let expiryText = "", expiryBg = "transparent", expiryBorder = "transparent";

  const getRgbaColor = (hex, pct) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "transparent";
    const percentInt = pct !== undefined ? parseInt(pct) : 100;
    const alpha = (100 - percentInt) / 100;
    return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
  };

  if (item.expiry_date && currentQty > 0) {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const daysPast = Math.floor((today - expiry) / (1000 * 60 * 60 * 24));

    if (daysToExpiry < 0) {
      expiryBg = getRgbaColor(cardInstance.config.color_expired, cardInstance.config.alpha_expired);
      expiryBorder = "rgba(219, 68, 55, 0.3)";
      expiryText = daysPast === 0 ? lang.scaduto_oggi : lang.scaduto_da_giorni.replace("{days}", daysPast);
    } else {
      let formattedLocaleDate = item.expiry_date;
      if (item.expiry_date.includes("-")) {
        const parts = item.expiry_date.split("-");
        if (parts.length === 3) formattedLocaleDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      expiryText = lang.scadenza_data.replace("{date}", formattedLocaleDate);
      if (daysToExpiry <= 10) { 
        expiryBg = getRgbaColor(cardInstance.config.color_10d, cardInstance.config.alpha_10d); expiryBorder = "rgba(230, 162, 60, 0.3)";
      } else if (daysToExpiry <= 30) { 
        expiryBg = getRgbaColor(cardInstance.config.color_30d, cardInstance.config.alpha_30d); expiryBorder = "rgba(255, 235, 59, 0.3)";
      }
    }
  }

  if (currentQty === 0) { customBg = getRgbaColor(cardInstance.config.color_qty0, cardInstance.config.alpha_qty0); customBorder = "rgba(219, 68, 55, 0.5)"; }
  else if (currentQty === 1) { customBg = getRgbaColor(cardInstance.config.color_qty1, cardInstance.config.alpha_qty1); customBorder = "rgba(244, 67, 54, 0.4)"; }
  else if (currentQty === 3) { customBg = getRgbaColor(cardInstance.config.color_qty3, cardInstance.config.alpha_qty3); customBorder = "rgba(255, 152, 0, 0.4)"; }

  let displayName = item.name || lang.senza_nome;
  if (item.unit) displayName += ` (${item.unit})`;

  let categoryHtml = "";
  if (item.category && item.category.trim() !== "") {
    categoryHtml = `<span style="font-style: italic; font-size: 0.8rem; color: var(--secondary-text-color); margin-left: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50%; text-align: right;">${item.category}</span>`;
  }

  const expiryHtml = expiryText ? `<div class="item-meta" style="background-color: ${expiryBg} !important; border: 1px solid ${expiryBorder}; padding: 2px 6px; border-radius: 4px; display: inline-block; width: max-content; max-width: 100%; box-sizing: border-box; white-space: nowrap;">${expiryText}</div>` : '';
  const isEditing = cardInstance._editingItemId === item.id;
  const centerDisplay = currentQty === 0 ? `<button class="btn-delete" data-name="${item.name}" style="background:transparent; border:none; padding:0; height:26px; width:26px; cursor:pointer;"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>` : `<span class="qty-display">${currentQty}</span>`;
  const editFormHtml = isEditing ? getEditFormHtml(item, lang, categoriesListArray) : "";

  return `
    <div class="item-card" style="background-color: ${customBg} !important; border: 1px solid ${customBorder};">
      ${!isEditing ? `<button class="edit-icon-btn" data-id="${item.id}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>` : ''}
      <div style="display: flex; flex-direction: column; min-width: 0; width: 100%;">
        <div class="item-name" style="padding-right: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
        <div style="display: flex; align-items: center; width: 100%; margin-top: 4px; overflow: hidden;">${expiryHtml}${categoryHtml}</div>
      </div>
      ${!isEditing ? `<div class="item-actions"><button class="btn-dec" data-name="${item.name}">-</button>${centerDisplay}<button class="btn-inc" data-name="${item.name}">+</button></div>` : ''}
      ${editFormHtml}
    </div>
  `;
}
