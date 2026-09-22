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

  const days10d = cardInstance.config && cardInstance.config.days_10d !== undefined ? cardInstance.config.days_10d : 10;
  const days30d = cardInstance.config && cardInstance.config.days_30d !== undefined ? cardInstance.config.days_30d : 30;
  const qty0Val = cardInstance.config && cardInstance.config.qty_0 !== undefined ? cardInstance.config.qty_0 : 0;
  const qty1Val = cardInstance.config && cardInstance.config.qty_1 !== undefined ? cardInstance.config.qty_1 : 1;
  const qty3Val = cardInstance.config && cardInstance.config.qty_3 !== undefined ? cardInstance.config.qty_3 : 3;

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
  else if (sortCriteria === "expiring_soon_desc") {
    const today = new Date(); 
    today.setHours(0,0,0,0);

    items = items.filter(item => {
      if ((item.quantity || 0) <= 0 || !item.expiry_date) return false;
      const expiry = new Date(item.expiry_date); 
      expiry.setHours(0,0,0,0);
      
      const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      const alertDays = (item.expiry_alert_days !== undefined && item.expiry_alert_days !== null && item.expiry_alert_days > 0) 
        ? item.expiry_alert_days 
        : days10d;

      return daysToExpiry >= 0 && daysToExpiry <= alertDays;
    });
    items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }
  else if (sortCriteria === "alert_exp_expired") {
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0 || !item.expiry_date) return false;
      const today = new Date(); today.setHours(0,0,0,0);
      return new Date(item.expiry_date) < today;
    });
    items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  } 
  else if (sortCriteria === "alert_exp_10d") {
    const today = new Date(); today.setHours(0,0,0,0);
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0 || !item.expiry_date) return false;
      const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
      const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return daysToExpiry >= 0 && daysToExpiry <= days10d;
    });
    items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }
  else if (sortCriteria === "alert_exp_30d") {
    const today = new Date(); today.setHours(0,0,0,0);
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0 || !item.expiry_date) return false;
      const expiry = new Date(item.expiry_date); expiry.setHours(0,0,0,0);
      const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return daysToExpiry >= 0 && daysToExpiry <= days30d;
    });
    items.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }
  else if (sortCriteria === "alert_qty_0") {
    items = items.filter(item => (item.quantity !== undefined ? item.quantity : 0) === qty0Val);
    items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } 
  else if (sortCriteria === "alert_qty_1") {
    items = items.filter(item => (item.quantity !== undefined ? item.quantity : 0) === qty1Val);
    items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  else if (sortCriteria === "alert_qty_3") {
    items = items.filter(item => (item.quantity !== undefined ? item.quantity : 0) === qty3Val);
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
  else if (sortCriteria.startsWith("loc_")) {
    const targetLocation = sortCriteria.replace("loc_", "");
    items = items.filter(item => {
      if ((item.quantity || 0) <= 0) return false;
      const itemLoc = item.location && item.location.trim() !== "" ? item.location.trim() : (lang.senza_posizione || "Senza Posizione");
      return itemLoc === targetLocation;
    });
    items.sort((a, b) => new Date(a.expiry_date || '9999-12-31') - new Date(b.expiry_date || '9999-12-31'));
  }
  return items;
}