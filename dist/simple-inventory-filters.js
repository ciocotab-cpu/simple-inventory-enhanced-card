import { getTranslation } from './simple-inventory-lang.js';

export function filterAndSortItems(cardInstance) {
  const lang = getTranslation(cardInstance._hass);
  let items = [...cardInstance.inventoryItems];
  
  if (cardInstance.searchQuery) { 
    items = items.filter(i => {
      const itemBarcode = i.barcodes || i.barcode_id || i.barcode || "";
      const barcodeStr = typeof itemBarcode === "object" ? JSON.stringify(itemBarcode) : String(itemBarcode);
      return (i.name && i.name.toLowerCase().includes(cardInstance.searchQuery)) ||
             (barcodeStr && barcodeStr.toLowerCase().includes(cardInstance.searchQuery));
    }); 
  }

  const sortCriteria = cardInstance.currentSort || "alpha";
  if (sortCriteria === "alpha") { items.sort((a, b) => (a.name || "").localeCompare(b.name || "")); } 
  else if (sortCriteria === "alpha_avail") {
    items = items.filter(item => (item.quantity || 0) > 0);
    items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } 
  else if (sortCriteria === "alpha_desc") {
    items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  } 
  else if (sortCriteria === "alpha_desc_avail") {
    items = items.filter(item => (item.quantity || 0) > 0);
    items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  } 
  else if (sortCriteria === "threshold") {
    items.sort((a, b) => {
      const aLow = (a.quantity || 0) <= (a.auto_add_to_list_quantity || 0) ? 1 : 0;
      const bLow = (b.quantity || 0) <= (b.auto_add_to_list_quantity || 0) ? 1 : 0;
      return bLow - aLow;
    });
  } 
  else if (sortCriteria === "threshold_avail") {
    items = items.filter(item => (item.quantity || 0) > 0);
    items.sort((a, b) => {
      const aLow = (a.quantity || 0) <= (a.auto_add_to_list_quantity || 0) ? 1 : 0;
      const bLow = (b.quantity || 0) <= (b.auto_add_to_list_quantity || 0) ? 1 : 0;
      return bLow - aLow;
    });
  } 
  else if (sortCriteria === "expiry") {
    items = items.filter(item => (item.quantity || 0) > 0);
    items.sort((a, b) => new Date(a.expiry_date || '9999-12-31') - new Date(b.expiry_date || '9999-12-31'));
  } 
  else if (sortCriteria === "only_expired") {
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0 || !item.expiry_date) return false;
      const today = new Date(); today.setHours(0,0,0,0);
      return new Date(item.expiry_date) < today;
    });
    items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  } 
  else if (sortCriteria === "only_empty") {
    items = items.filter(item => (item.quantity !== undefined ? item.quantity : 0) === 0);
    items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } 
  else if (sortCriteria.startsWith("cat_")) {
    const targetCategory = sortCriteria.replace("cat_", "");
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0) return false;
      const itemCat = item.category && item.category.trim() !== "" ? item.category.trim() : lang.senza_categoria;
      return itemCat === targetCategory;
    });
    items.sort((a, b) => new Date(a.expiry_date || '9999-12-31') - new Date(b.expiry_date || '9999-12-31'));
  }
  return items;
}