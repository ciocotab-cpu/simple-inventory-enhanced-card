import { getAddPopupHtml } from './simple-inventory-templates.js';

// Funzione helper per caricare lo script evitando i blocchi di DOM
function loadHtml5QrcodeScript() {
  return new Promise((resolve, reject) => {
    if (typeof Html5Qrcode !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    // Carica da unpkg o dal percorso locale di HA
    script.src = "https://unpkg.com/html5-qrcode";
    script.type = "text/javascript";
    
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    
    document.head.appendChild(script);
  });
}

export async function startCameraScanner(cardInstance, lang) {
  try {
    await loadHtml5QrcodeScript();
  } catch (e) {
    console.error("Errore nel caricamento del file locale:", e);
    alert("Impossibile caricare lo script dello scanner.");
    return;
  }

  // Creazione overlay
  const overlay = document.createElement("div");
  overlay.id = "scanner-fullscreen-overlay";
  overlay.style = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; color:white;";
  
  overlay.innerHTML = `
    <div style="position:relative; width:85%; max-width:450px; background:#1a1a1a; padding:16px; border-radius:12px; text-align:center; border:1px solid #333;">
      <div style="font-weight:bold; margin-bottom:10px; font-size:1.1rem;">Inquadra Codice a Barre</div>
      <div id="camera-preview-region" style="width:100%; max-height:300px; background:#000; border-radius:8px; overflow:hidden;"></div>
      <button id="close-scanner-btn" style="margin-top:16px; background:#db4437; border:none; padding:10px 20px; color:white; font-weight:bold; border-radius:6px; cursor:pointer; width:100%;">Annulla Scansione</button>
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
      
      // Chiusura pulita fotocamera senza interrompere lo script in caso di eccezione
      try {
        await html5Qrcode.stop();
      } catch (err) {
        console.warn("Stop scanner non completato:", err);
      }
      
      try {
        html5Qrcode.clear();
      } catch (err) {}
      
      overlay.remove();

      // Controllo se il prodotto esiste già
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

      // Prodotto non presente: salvataggio cache e chiamata OpenFoodFacts
      cardInstance._scannedBarcodeCache = barcodeText;
      cardInstance._scannedDataCache = { name: "", category: "", unit: "" };

      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeText}.json`);
        if (response.ok) {
          const resData = await response.json();
          if (resData && resData.product) {
            const p = resData.product;
            cardInstance._scannedDataCache.name = p.product_name_it || p.product_name || "";
            
            if (p.categories_tags && p.categories_tags.length > 0) {
              const rawCat = p.categories_tags[0];
              let cleanCat = rawCat.includes(":") ? rawCat.split(":")[1] : rawCat;
              cardInstance._scannedDataCache.category = cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1).replace(/-/g, " ");
            }
            
            if (p.quantity && p.quantity.trim() !== "") {
              let qStr = p.quantity.toLowerCase().trim();
              if (qStr.endsWith("g") || qStr.includes("gram")) {
                let num = parseInt(qStr) || "";
                cardInstance._scannedDataCache.unit = num ? `${num} Grammi` : p.quantity;
              } else if (qStr.endsWith("l") || qStr.includes("liter") || qStr.includes("litro")) {
                let num = parseFloat(qStr) || "";
                cardInstance._scannedDataCache.unit = num ? `${num} Litro` : p.quantity;
              } else {
                cardInstance._scannedDataCache.unit = p.quantity;
              }
            }
          }
        }
      } catch (err) { 
        console.warn("OpenFoodFacts offline."); 
      }

      // Impostazione per mostrare il popup e re-render grafico
      cardInstance._showAddPopup = true;
      if (typeof cardInstance.updateCard === "function") {
        cardInstance.updateCard();
      } else if (typeof cardInstance.requestUpdate === "function") {
        cardInstance.requestUpdate();
      }
    },
    () => {}
  ).catch((err) => { 
    console.error(err);
    alert("Impossibile accedere alla fotocamera. Verifica che la pagina sia in HTTPS e di aver dato i permessi."); 
    overlay.remove(); 
  });
}