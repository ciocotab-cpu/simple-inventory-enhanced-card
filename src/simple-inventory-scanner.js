//import { getAddPopupHtml } from './simple-inventory-templates.js';
import { getTranslation } from './simple-inventory-lang.js';

// Funzione helper per caricare lo script evitando i blocchi di DOM
function loadHtml5QrcodeScript() {
  return new Promise((resolve, reject) => {
    if (typeof Html5Qrcode !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.type = "text/javascript";
    
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    
    document.head.appendChild(script);
  });
}

/**
 * Pulisce il nome rimuovendo grammature/volumi e formatta la confezione.
 */
function parseProductNameAndUnit(rawName, rawQuantity) {
  let cleanName = rawName || "";
  let extractedUnit = "";

  const prefixSizeRegex = /\b(GR|G|KG|ML|CL|L)\.?\s*(\d+(?:[\.,]\d+)?)\b/gi;
  const suffixSizeRegex = /\b(\d+(?:[\.,]\d+)?)\s*(g|gr|grammi|kg|kilo|chili|ml|cl|dl|l|litri|litro)\b/gi;

  let match = prefixSizeRegex.exec(cleanName);

  if (match) {
    const unitType = match[1].toLowerCase();
    const num = match[2].replace(',', '.');

    if (['gr', 'g'].includes(unitType)) {
      extractedUnit = `${num} Grammi`;
    } else if (unitType === 'kg') {
      extractedUnit = `${num} Kg`;
    } else if (unitType === 'l') {
      extractedUnit = `${num} Litro`;
    } else if (['ml', 'cl'].includes(unitType)) {
      extractedUnit = `${num} ${unitType.toUpperCase()}`;
    }

    cleanName = cleanName.replace(prefixSizeRegex, "").trim();
  } else {
    match = suffixSizeRegex.exec(cleanName);
    if (match) {
      const num = match[1].replace(',', '.');
      const unitType = match[2].toLowerCase();

      if (['g', 'gr', 'grammi'].includes(unitType)) {
        extractedUnit = `${num} Grammi`;
      } else if (['kg', 'kilo', 'chili'].includes(unitType)) {
        extractedUnit = `${num} Kg`;
      } else if (['l', 'litri', 'litro'].includes(unitType)) {
        extractedUnit = `${num} Litro`;
      } else if (['ml', 'cl', 'dl'].includes(unitType)) {
        extractedUnit = `${match[1]} ${unitType.toUpperCase()}`;
      }

      cleanName = cleanName.replace(suffixSizeRegex, "").trim();
    }
  }

  if (!extractedUnit && rawQuantity && rawQuantity.trim() !== "") {
    let qStr = rawQuantity.toLowerCase().trim();
    if (qStr.endsWith("g") || qStr.includes("gram")) {
      let num = parseInt(qStr) || "";
      extractedUnit = num ? `${num} Grammi` : rawQuantity;
    } else if (qStr.endsWith("l") || qStr.includes("liter") || qStr.includes("litro")) {
      let num = parseFloat(qStr) || "";
      extractedUnit = num ? `${num} Litro` : rawQuantity;
    } else {
      extractedUnit = rawQuantity;
    }
  }

  cleanName = cleanName.replace(/[\s\-_,.]+$|^[\s\-_,.]+/, "").replace(/\s+/g, " ").trim();

  return {
    name: cleanName,
    unit: extractedUnit
  };
}

function resolveProductName(product, primaryLang) {
  if (!product) return "";

  const langCode = (typeof primaryLang === "string" ? primaryLang : "it").toLowerCase().split("-")[0].split("_")[0];
  const allLangs = ["en", "it", "es", "de", "fr"];
  const keysToTry = [];

  keysToTry.push(`product_name_${langCode}`);
  keysToTry.push("product_name");
  allLangs.forEach(code => {
    if (code !== langCode) keysToTry.push(`product_name_${code}`);
  });

  for (const key of keysToTry) {
    if (product[key] && typeof product[key] === "string" && product[key].trim() !== "") {
      return product[key].trim();
    }
  }

  return "";
}

/**
 * Tenta di recuperare i dati interrogando prima il subdomini Open Food Facts nazionale (es. it, fr, es, de, uk),
 * poi il database mondiale (world) e infine UPC Item DB come fallback universale.
 */
async function fetchProductData(barcodeText, primaryLangCode, countryCode = "it") {
  let result = { name: "", category: "", unit: "" };

  const queryApi = async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.product) {
          const p = data.product;
          const rawName = resolveProductName(p, primaryLangCode);
          if (rawName) {
            const parsed = parseProductNameAndUnit(rawName, p.quantity);
            result.name = parsed.name;
            result.unit = parsed.unit;

            if (p.categories_tags && p.categories_tags.length > 0) {
              const rawCat = p.categories_tags[0];
              let cleanCat = rawCat.includes(":") ? rawCat.split(":")[1] : rawCat;
              result.category = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).replace(/-/g, " ");
            }
            return true;
          }
        }
      }
    } catch (err) {}
    return false;
  };

  // 1. Ricerca sul database nazionale selezionato (se non è "world")
  let found = false;
  if (countryCode && countryCode !== "world") {
    found = await queryApi(`https://${countryCode}.openfoodfacts.org/api/v0/product/${barcodeText}.json`);
  }

  // 2. Se non trovato, ricerca sul database Mondiale di Open Food Facts
  if (!found) {
    found = await queryApi(`https://world.openfoodfacts.org/api/v0/product/${barcodeText}.json`);
  }

  // 3. Se ancora non trovato, fallback su UPC Item DB
  if (!found) {
    try {
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeText}`);
      if (upcResponse.ok) {
        const upcData = await upcResponse.json();
        if (upcData && upcData.items && upcData.items.length > 0) {
          const item = upcData.items[0];
          const rawName = item.title || item.description || "";
          if (rawName) {
            const parsed = parseProductNameAndUnit(rawName, "");
            result.name = parsed.name;
            result.unit = parsed.unit;
            if (item.category) {
              result.category = item.category.split(">").pop().trim();
            }
            found = true;
          }
        }
      }
    } catch (err) {}
  }

  return result;
}

export async function startCameraScanner(cardInstance, lang, onScanCallback) {
  try {
    await loadHtml5QrcodeScript();
  } catch (e) {
    console.error("Errore nel caricamento del file locale:", e);
    alert("Impossibile caricare lo script dello scanner.");
    return;
  }

  const hassObj = (cardInstance && (cardInstance._hass || cardInstance.hass)) || {};
  const configObj = (cardInstance && (cardInstance._config || cardInstance.config)) || {};
  const countryCode = configObj.barcode_provider || "it";
  
  let t = {};
  try {
    t = getTranslation(hassObj) || {};
  } catch (err) {
    console.warn("Impossibile caricare le traduzioni da getTranslation:", err);
  }

  let primaryLangCode = "it";
  if (typeof lang === "string") {
    primaryLangCode = lang;
  } else if (hassObj.language) {
    primaryLangCode = hassObj.language;
  } else if (navigator.language) {
    primaryLangCode = navigator.language;
  }

  const oldOverlay = document.getElementById("scanner-fullscreen-overlay");
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement("div");
  overlay.id = "scanner-fullscreen-overlay";
  overlay.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; color:white;";
  
  overlay.innerHTML = `
    <div style="position:relative; width:85%; max-width:450px; background:#1a1a1a; padding:16px; border-radius:12px; text-align:center; border:1px solid #333;">
      <div style="font-weight:bold; margin-bottom:10px; font-size:1.1rem;">Inquadra Codice a Barre</div>
      <div id="camera-preview-region" style="width:100%; max-height:300px; background:#000; border-radius:8px; overflow:hidden;"></div>
      <button id="close-scanner-btn" style="margin-top:16px; background:#db4437; border:none; padding:10px 20px; color:white; font-weight:bold; border-radius:6px; cursor:pointer; width:100%;">
        ${t.btn_cancel || "Annulla"}
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const html5Qrcode = new Html5Qrcode("camera-preview-region");

  const closeScanner = () => { 
    html5Qrcode.stop().catch(() => {}).then(() => { 
      html5Qrcode.clear(); 
      overlay.remove();    
    }); 
  };
  
  overlay.querySelector("#close-scanner-btn").addEventListener("click", closeScanner);

  html5Qrcode.start(
    { facingMode: "environment" },
    { 
      fps: 10, 
      qrbox: (width, height) => {
        return { width: Math.min(width * 0.75, 260), height: Math.min(height * 0.35, 120) };
      },
      aspectRatio: 1.0 
    },
    async (barcodeText) => {
      if (navigator.vibrate) navigator.vibrate(100);
      barcodeText = barcodeText.trim();
      
      try {
        await html5Qrcode.stop();
      } catch (err) {}
      
      try {
        html5Qrcode.clear();
      } catch (err) {}
      
      overlay.remove();

      if (typeof onScanCallback === "function") {
        onScanCallback(barcodeText);
        return;
      }

      const items = cardInstance.inventoryItems || [];
      const existingProduct = items.find(i => {
        const b = i.barcode || i.barcode_id || "";
        return String(b).trim() === barcodeText;
      });

      if (existingProduct) {
        cardInstance._editingItemId = existingProduct.id;
        if (typeof cardInstance.updateCard === "function") cardInstance.updateCard();
        else if (typeof cardInstance.requestUpdate === "function") cardInstance.requestUpdate();
        return;
      }

      cardInstance._scannedBarcodeCache = barcodeText;
      cardInstance._scannedDataCache = { name: "", category: "", unit: "" };

      // Chiamata con priorità nazionale -> mondiale -> UPC
      const fetchedProduct = await fetchProductData(barcodeText, primaryLangCode, countryCode);

      if (fetchedProduct.name) {
        cardInstance._scannedDataCache.name = fetchedProduct.name;
        cardInstance._scannedDataCache.unit = fetchedProduct.unit;
        cardInstance._scannedDataCache.category = fetchedProduct.category;
      } else {
        cardInstance._scannedDataCache.name = t.error_barcode || t.senza_nome || "Nessun Prodotto trovato con questo codice a barre";
      }

      cardInstance._showAddPopup = true;
      if (typeof cardInstance.updateCard === "function") {
        cardInstance.updateCard();
      } else if (typeof cardInstance.requestUpdate === "function") {
        cardInstance.requestUpdate();
      }
    },
    () => {}
  ).catch((err) => { 
    console.error("Errore fotocamera Android:", err);
    alert("Impossibile accedere alla fotocamera. Verifica di usare HTTPS e di aver concesso i permessi."); 
    overlay.remove(); 
  });
}