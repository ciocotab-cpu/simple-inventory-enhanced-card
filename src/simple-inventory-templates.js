export function getEditFormHtml(item, lang, dataObj = {}) {
  const currentBarcode = item.barcode || item.barcodes || item.barcode_id || "";

  const categoriesList = Array.isArray(dataObj) ? dataObj : (dataObj.categories || []);
  const todoLists = dataObj.todoLists || [];
  
  let catOptions = categoriesList.map(cat => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`).join('');

  return `
    <div class="item-edit-form" style="max-width: 650px; width: 95%;">
      <div style="font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; margin-bottom: 12px; color: var(--primary-text-color);">${lang.popup_edit_title}</div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- RIGA 1: Nome Prodotto - Quantità iniziale -->
        <div style="display: flex; gap: 12px; align-items: flex-end; width: 100%;">
          <div class="edit-field" style="flex: 7;"><label>${lang.field_name}</label><input type="text" id="edit_name" value="${item.name || ''}" placeholder="${lang.field_name_placeholder}"></div>
          <div class="edit-field" style="flex: 3;"><label>${lang.field_qty}</label>
            <div style="display: flex; align-items: center; border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden; background: var(--card-background-color); height: 38px;">
              <button type="button" id="edit-qty-dec" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">-</button>
              <input type="number" id="edit_qty" value="${item.quantity !== undefined ? item.quantity : 0}" style="flex: 1; text-align: center; border: none; height: 100%; padding: 0; background: transparent; font-weight: bold; -moz-appearance: textfield;">
              <button type="button" id="edit-qty-inc" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">+</button>
            </div>
          </div>
        </div>
        
        <!-- RIGA 2: Unità - Categoria (Griglia fissa) -->
        <div style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important;">
          <div class="edit-field" style="width: 100%;"><label>${lang.lbl_unit}</label><input type="text" id="edit_unit" value="${item.unit || ''}" placeholder="${lang.lbl_unit_placeholder}"></div>
          <div class="edit-field" style="width: 100%;">
            <label>${lang.lbl_cat}</label>
            <select id="edit_cat_select" style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer; font-family: inherit; box-sizing: border-box;">
              <option value="">${lang.lbl_cat_placeholder}</option>
              ${catOptions}
              <option value="__NEW_CAT__">${lang.lbl_cat_new_cat}</option>
            </select>
          </div>
        </div>

        <div class="edit-field full-width" id="edit_cat_custom_container" style="display: none; width: 100%;">
          <input type="text" id="edit_cat_custom" placeholder="${lang.lbl_cat_new_cat_placeholder}">
        </div>
        
        <!-- RIGA 3: Scadenza - giorni preavviso -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_expiry}</label><input type="date" id="edit_expiry" value="${item.expiry_date || ''}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_exp_alert}</label><input type="number" id="edit_exp_alert" value="${item.expiry_alert_days !== undefined ? item.expiry_alert_days : 0}"></div>
        </div>
        
        <!-- RIGA 4: descrizione estesa - alias -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_desc}</label><input type="text" id="edit_desc" value="${item.description || ''}" placeholder="${lang.lbl_desc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_aliases}</label><input type="text" id="edit_aliases" value="${item.aliases || ''}" placeholder="${lang.lbl_aliases_placeholder}"></div>
        </div>
        
        <!-- RIGA 5: posizione - prezzo - codice a barre -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_loc}</label><input type="text" id="edit_loc" value="${item.location || ''}" placeholder="${lang.lbl_loc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_price}</label><input type="number" step="0.01" id="edit_price" value="${item.price !== undefined ? item.price : ''}" placeholder="${lang.lbl_price_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_barcode}</label><input type="text" id="edit_barcode" value="${currentBarcode}"></div>
        </div>

        <!-- RIGA 6: Lista To-Do automatica -->
        <div style="border: 1px solid var(--divider-color); border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" id="edit_auto_add_checkbox" ${item.auto_add_id_to_description_enabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
            <label for="edit_auto_add_checkbox" style="font-weight: bold; font-size: 0.85rem; cursor: pointer; color: var(--primary-text-color);">${lang.lbl_auto_add}</label>
          </div>
          
          <div id="edit_auto_add_subrow" style="display: flex; gap: 10px; flex-wrap: wrap; opacity: ${item.auto_add_id_to_description_enabled ? '1' : '0.5'}; transition: opacity 0.2s;">
            <div class="edit-field" style="flex: 1; min-width: 160px;">
              <label>${lang.lbl_min_qty}</label>
              <input type="number" id="edit_min_qty" value="${item.auto_add_to_list_quantity !== undefined ? item.auto_add_to_list_quantity : 2}" placeholder="${lang.lbl_min_qty_placeholder}" ${!item.auto_add_id_to_description_enabled ? 'disabled' : ''}>
            </div>
            
            <div class="edit-field" style="flex: 2; min-width: 110px;">
              <label>${lang.lbl_todo}</label>
              <select id="edit_todo" ${!item.auto_add_id_to_description_enabled ? 'disabled' : ''} style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="">${lang.lbl_todo_placeholder}</option>
                ${todoLists.map(t => `<option value="${t.entity_id}" ${item.todo_list === t.entity_id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="edit-field" style="flex: 1.5; min-width: 130px;">
              <label>${lang.lbl_todo_placement}</label>
              <select id="edit_todo_placement" ${!item.auto_add_id_to_description_enabled ? 'disabled' : ''} style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="name" ${item.todo_quantity_placement === 'name' ? 'selected' : ''}>${lang.opt_placement_name}</option>
                <option value="description" ${item.todo_quantity_placement === 'description' ? 'selected' : ''}>${lang.opt_placement_desc}</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <div class="edit-form-actions">
        <button class="btn-cancel-edit">${lang.btn_cancel}</button>
        <button class="btn-save-edit" data-id="${item.id}" data-oldname="${item.name}">${lang.btn_save}</button>
      </div>
    </div>
  `;
}

export function getAddPopupHtml(lang, categoriesList = [], dataObj = {}) {
  const todoLists = dataObj.todoLists || [];
  let catOptions = categoriesList.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  return `
    <div class="item-add-popup" style="max-width: 650px; width: 95%;">
      <div style="font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; margin-bottom: 12px; color: var(--primary-text-color);">${lang.popup_add_title}</div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- RIGA 1: Nome Prodotto - Quantità iniziale -->
        <div style="display: flex; gap: 12px; align-items: flex-end; width: 100%;">
          <div class="edit-field" style="flex: 7;"><label>${lang.field_name}</label><input type="text" id="new-name" placeholder="${lang.field_name_placeholder}"></div>
          <div class="edit-field" style="flex: 3;"><label>${lang.field_qty}</label>
            <div style="display: flex; align-items: center; border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden; background: var(--card-background-color); height: 38px;">
              <button type="button" id="add-qty-dec" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">-</button>
              <input type="number" id="new-qty" value="1" style="flex: 1; text-align: center; border: none; height: 100%; padding: 0; background: transparent; font-weight: bold; -moz-appearance: textfield;">
              <button type="button" id="add-qty-inc" style="background: transparent; border: none; color: var(--primary-text-color); font-weight: bold; width: 32px; height: 100%; cursor: pointer; font-size: 1.2rem;">+</button>
            </div>
          </div>
        </div>
        
        <!-- RIGA 2: Unità - Categoria (Griglia fissa) -->
        <div style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; width: 100% !important;">
          <div class="edit-field" style="width: 100%;"><label>${lang.lbl_unit}</label><input type="text" id="new_unit" placeholder="${lang.lbl_unit_placeholder}"></div>
          <div class="edit-field" style="width: 100%;">
            <label>${lang.lbl_cat}</label>
            <select id="new_cat_select" style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer; font-family: inherit; box-sizing: border-box;">
              <option value="">${lang.lbl_cat_placeholder}</option>
              ${catOptions}
              <option value="__NEW_CAT__">${lang.lbl_cat_new_cat}</option>
            </select>
          </div>
        </div>

        <div class="edit-field full-width" id="new_cat_custom_container" style="display: none; width: 100%;">
          <input type="text" id="new_cat_custom" placeholder="${lang.lbl_cat_new_cat_placeholder}">
        </div>
        
        <!-- RIGA 3: Scadenza - giorni preavviso -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_expiry}</label><input type="date" id="new_expiry"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_exp_alert}</label><input type="number" id="new_exp_alert" value="0"></div>
        </div>
        
        <!-- RIGA 4: descrizione estesa - alias -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_desc}</label><input type="text" id="new_desc" placeholder="${lang.lbl_desc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_aliases}</label><input type="text" id="new_aliases" placeholder="${lang.lbl_aliases_placeholder}"></div>
        </div>
        
        <!-- RIGA 5: posizione - prezzo - codice a barre -->
        <div style="display: flex; gap: 12px; width: 100%;">
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_loc}</label><input type="text" id="new_loc" placeholder="${lang.lbl_loc_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_price}</label><input type="number" step="0.01" id="new_price" placeholder="${lang.lbl_price_placeholder}"></div>
          <div class="edit-field" style="flex: 1;"><label>${lang.lbl_barcode}</label><input type="text" id="new_barcode"></div>
        </div>

        <!-- RIGA 6: Lista To-Do automatica -->
        <div style="border: 1px solid var(--divider-color); border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" id="new_auto_add_checkbox" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="new_auto_add_checkbox" style="font-weight: bold; font-size: 0.85rem; cursor: pointer; color: var(--primary-text-color);">${lang.lbl_auto_add}</label>
          </div>
          
          <div id="new_auto_add_subrow" style="display: flex; gap: 10px; flex-wrap: wrap; opacity: 0.5; transition: opacity 0.2s;">
            <div class="edit-field" style="flex: 1; min-width: 110px;">
              <label>${lang.lbl_min_qty}</label>
              <input type="number" id="new_min_qty" value="2" placeholder="${lang.lbl_min_qty_placeholder}" disabled>
            </div>
            
            <div class="edit-field" style="flex: 2; min-width: 160px;">
              <label>${lang.lbl_todo}</label>
              <select id="new_todo" disabled style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="">${lang.lbl_todo_placeholder}</option>
                ${todoLists.map(t => `<option value="${t.entity_id}">${t.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="edit-field" style="flex: 1.5; min-width: 130px;">
              <label>${lang.lbl_todo_placement}</label>
              <select id="new_todo_placement" disabled style="width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); font-size: 0.85rem; height: 34px; outline: none; cursor: pointer;">
                <option value="name">${lang.opt_placement_name}</option>
                <option value="description">${lang.opt_placement_desc}</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <div class="edit-form-actions">
        <button class="btn-cancel-add" id="btn-add-cancel">${lang.btn_cancel}</button>
        <button class="btn-save-add" id="btn-add-save">${lang.btn_add}</button>
      </div>
    </div>
  `;
}