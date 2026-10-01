import { getAddPopupHtml } from './simple-inventory-templates.js';
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
 * Gestisce sia il formato '150g' / '150 gr' sia il formato 'GR150' / 'GR. 150'.
 */
function parseProductNameAndUnit(rawName, rawQuantity) {
  let cleanName = rawName || "";
  let extractedUnit = "";

  // 1. Regex per prefissi tipo: GR150, GR.150, GR 150, G150, KG1, L1.5
  const prefixSizeRegex = /\b(GR|G|KG|ML|CL|L)\.?\s*(\d+(?:[\.,]\d+)?)\b/gi;
  
  // 2. Regex per suffissi classici tipo: 150g, 150 gr, 1kg, 1.5l, 33cl, 250ml
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

  // Se non ha trovato l'unità nel nome, usa il campo quantity di OpenFoodFacts
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

  // Pulisce simboli, trattini o spazi residui lasciati dalla rimozione
  cleanName = cleanName.replace(/[\s\-_,.]+$|^[\s\-_,.]+/, "").replace(/\s+/g, " ").trim();

  return {
    name: cleanName,
    unit: extractedUnit
  };
}

/**
 * Risolve il nome del prodotto partendo dalla lingua di sistema/scelta da Open Food Facts.
 */
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
 * Tenta di recuperare i dati del prodotto usando in sequenza:
 * 1. Open Food Facts
 * 2. UPC Item DB (Fallback)
 */
async function fetchProductData(barcodeText, primaryLangCode) {
  let result = { name: "", category: "", unit: "" };

  // --- TENTATIVO 1: Open Food Facts ---
  try {
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeText}.json`);
    if (offResponse.ok) {
      const offData = await offResponse.json();
      if (offData && offData.product) {
        const p = offData.product;
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
          return result; // Trovato su OFF!
        }
      }
    }
  } catch (err) {
    console.warn("OpenFoodFacts non disponibile, provo con UPC Item DB...");
  }

  // --- TENTATIVO 2: UPC Item DB (Fallback) ---
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
          return result; // Trovato su UPC Item DB!
        }
      }
    }
  } catch (err) {
    console.warn("Anche UPC Item DB ha fallito o è andato in timeout.");
  }

  return result; // Nessun dato trovato
}

export async function startCameraScanner(cardInstance, lang) {
  try {
    await loadHtml5QrcodeScript();
  } catch (e) {
    console.error("Errore nel caricamento del file locale:", e);
    alert("Impossibile caricare lo script dello scanner.");
    return;
  }

  const hassObj = (cardInstance && (cardInstance._hass || cardInstance.hass)) || {};
  
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

      const items = cardInstance.inventoryItems || [];
      const existingProduct = items.find(i => {
        const b = i.barcode || i.barcodes || i.barcode_id || "";
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

      // Chiamata alle API con strategia a cascata (OFF -> UPC Item DB)
      const fetchedProduct = await fetchProductData(barcodeText, primaryLangCode);

      if (fetchedProduct.name) {
        cardInstance._scannedDataCache.name = fetchedProduct.name;
        cardInstance._scannedDataCache.unit = fetchedProduct.unit;
        cardInstance._scannedDataCache.category = fetchedProduct.category;
      } else {
        // Fallback finale sul messaggio di errore del file di lingua
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