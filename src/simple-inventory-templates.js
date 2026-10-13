// Funzione interna comune per generare il form HTML
function renderItemFormHtml({ isEdit, title, lang, item = {}, categoriesList = [], todoLists = [] }) {
  const currentBarcode = item.barcode || item.barcode_id || "";
  
  // Prefissi e valori in base alla modalità (Edit o Add)
  const p = isEdit ? "edit" : "new";
  
  const catOptions = categoriesList.map(cat => 
    `<option value="${cat}" ${isEdit && item.category === cat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  const nameVal = isEdit ? (item.name || '') : '';
  const qtyVal = isEdit ? (item.quantity !== undefined ? item.quantity : 0) : 1;
  const unitVal = isEdit ? (item.unit || '') : '';
  const expiryVal = isEdit ? (item.expiry_date || '') : '';
  const alertVal = isEdit ? (item.expiry_alert_days !== undefined ? item.expiry_alert_days : 0) : 0;
  const descVal = isEdit ? (item.description || '') : '';
  const aliasesVal = isEdit ? (item.aliases || '') : '';
  const locVal = isEdit ? (item.location || '') : '';
  const priceVal = isEdit ? (item.price !== undefined ? item.price : '') : '';
  const autoChecked = isEdit && item.auto_add_id_to_description_enabled;

  return `
    <div class="${isEdit ? 'item-edit-form' : 'item-add-popup'}" style="max-width: 650px; width: 95%;">
      <div style="font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; margin-bottom: 12px; color: var(--primary-text-color);">${title}</div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- RIGA 1: Nome - Quantità -->
        <div style="display: flex; gap: 12px; align-items: flex-end; width: 100%;">
          <div class="edit-field" style="flex: 7;"><label>${lang.field_name}</label><input type="text" id="${isEdit ? 'edit_name' : 'new-name'}" value="${nameVal}" placeholder="${lang.field_name_placeholder}"></div>
          <div class="edit-field" style="flex: 3;"><label>${lang.field_qty}</label>
            <div style="display: flex; align-items: center; border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden; background: var(--card-background-color); height: 38px;">
              <button type="button" id="${p}-qty-dec" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">-</button>
              <input type="number" id="${isEdit ? 'edit_qty' : 'new-qty'}" value="${qtyVal}" style="flex: 1; text-align: center; border: none; height: 100%; padding: 0; background: transparent; font-weight: bold; -moz-appearance: textfield;">
              <button type="button" id="${p}-qty-inc" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">+</button>
            </div>
          </div>
        </div>
        
        <!-- RIGA 2: Unità - Categoria -->
        <div style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important;">
          <div class="edit-field" style="width: 100%;"><label>${lang.lbl_unit}</label><input type="text" id="${p}_unit" value="${unitVal}" placeholder="${lang.lbl_unit_placeholder}"></div>
          <div class="edit-field" style="width: 100%;">
            <label>${lang.lbl_cat}</label>
            <select id="${p}_cat_select" style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer; font-family: inherit; box-sizing: border-box;">
              <option value="">${lang.lbl_cat_placeholder}</option>
              ${catOptions}
              <option value="__NEW_CAT__">${lang.lbl_cat_new_cat}</option>
            </select>
          </div>
        </div>

        <div class="edit-field full-width" id="${p}_cat_custom_container" style="display: none; width: 100%;">
          <input type="text" id="${p}_cat_custom" placeholder="${lang.lbl_cat_new_cat_placeholder}">
        </div>
        
        <!-- RIGA 3: Scadenza - Preavviso -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_expiry}</label><input type="date" id="${p}_expiry" value="${expiryVal}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_exp_alert}</label><input type="number" id="${p}_exp_alert" value="${alertVal}"></div>
        </div>
        
        <!-- RIGA 4: Descrizione - Alias -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_desc}</label><input type="text" id="${p}_desc" value="${descVal}" placeholder="${lang.lbl_desc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_aliases}</label><input type="text" id="${p}_aliases" value="${aliasesVal}" placeholder="${lang.lbl_aliases_placeholder}"></div>
        </div>
        
        <!-- RIGA 5: Posizione - Prezzo - Barcode -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_loc}</label><input type="text" id="${p}_loc" value="${locVal}" placeholder="${lang.lbl_loc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_price}</label><input type="number" step="0.01" id="${p}_price" value="${priceVal}" placeholder="${lang.lbl_price_placeholder}"></div>
          <div class="edit-field" style="flex: 1;">
            <label>${lang.lbl_barcode}</label>
            <div style="position: relative; display: flex; align-items: center; width: 100%;">
              <input type="text" id="${p}_barcode" value="${currentBarcode}" style="width: 100%; padding-right: 36px; box-sizing: border-box;">
              <button type="button" class="input-scan-btn" data-target="${p}_barcode" title="${lang.scan_barcode || 'Scan barcode'}" style="position: absolute; right: 4px; background: transparent; border: none; cursor: pointer; color: var(--primary-text-color); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0;">
                <ha-icon icon="mdi:barcode-scan" style="--mdc-icon-size: 20px;"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGA 6: To-Do -->
        <div style="border: 1px solid var(--divider-color); border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" id="${p}_auto_add_checkbox" ${autoChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
            <label for="${p}_auto_add_checkbox" style="font-weight: bold; font-size: 0.85rem; cursor: pointer; color: var(--primary-text-color);">${lang.lbl_auto_add}</label>
          </div>
          
          <div id="${p}_auto_add_subrow" style="display: ${!isEdit || autoChecked ? 'flex' : 'none'}; gap: 10px; flex-wrap: wrap; ${!isEdit ? 'opacity: 0.5;' : ''} transition: opacity 0.2s;">
            <div class="edit-field" style="flex: 1; min-width: ${isEdit ? '160px' : '110px'};">
              <label>${lang.lbl_min_qty}</label>
              <input type="number" id="${p}_min_qty" value="${isEdit && item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : 2}" placeholder="${lang.lbl_min_qty_placeholder}" ${!isEdit || !autoChecked ? 'disabled' : ''}>
            </div>
            
            <div class="edit-field" style="flex: 2; min-width: ${isEdit ? '110px' : '160px'};">
              <label>${lang.lbl_todo}</label>
              <select id="${p}_todo" ${!isEdit || !autoChecked ? 'disabled' : ''} style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="">${lang.lbl_todo_placeholder}</option>
                ${todoLists.map(t => `<option value="${t.entity_id}" ${isEdit && item.todo_list === t.entity_id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="edit-field" style="flex: 1.5; min-width: 130px;">
              <label>${lang.lbl_todo_placement}</label>
              <select id="${p}_todo_placement" ${!isEdit || !autoChecked ? 'disabled' : ''} style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="name" ${isEdit && item.todo_quantity_placement === 'name' ? 'selected' : ''}>${lang.opt_placement_name}</option>
                <option value="description" ${isEdit && item.todo_quantity_placement === 'description' ? 'selected' : ''}>${lang.opt_placement_desc}</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <div class="edit-form-actions">
        <button class="${isEdit ? 'btn-cancel-edit' : 'btn-cancel-add'}" ${!isEdit ? 'id="btn-add-cancel"' : ''}>${lang.btn_cancel}</button>
        <button class="${isEdit ? 'btn-save-edit' : 'btn-save-add'}" ${isEdit ? `data-id="${item.id}" data-oldname="${item.name}"` : 'id="btn-add-save"'}>${isEdit ? lang.btn_save : lang.btn_add}</button>
      </div>
    </div>
  `;
}

// Le esportazioni pubbliche rimangono intatte per non rompere il resto dell'applicazione:
export function getEditFormHtml(item, lang, categoriesInput = [], dataObj = {}) {
  const categoriesList = Array.isArray(categoriesInput) ? categoriesInput : (categoriesInput.categories || dataObj.categories || []);
  return renderItemFormHtml({
    isEdit: true,
    title: lang.popup_edit_title,
    lang,
    item,
    categoriesList,
    todoLists: dataObj.todoLists || []
  });
}

export function getAddPopupHtml(lang, categoriesInput = [], dataObj = {}) {
  const categoriesList = Array.isArray(categoriesInput) ? categoriesInput : (categoriesInput.categories || dataObj.categories || []);
  return renderItemFormHtml({
    isEdit: false,
    title: lang.popup_add_title,
    lang,
    categoriesList,
    todoLists: dataObj.todoLists || []
  });
}