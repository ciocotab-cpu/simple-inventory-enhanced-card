export const cardStyles = `
  :host { 
    --grid-gap: 8px; 
    --accent-color: var(--store-accent-color, #03a9f4); 
  }
  
  ha-card { padding: 16px; }
  .header-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .title-row { display: flex; justify-content: space-between; align-items: center; position: relative; }
  .card-header-text { font-size: 1.2rem; font-weight: bold; color: var(--primary-text-color); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .header-buttons {
    display: flex; gap: 6px; align-items: center;
  }

  .add-trigger-btn, .io-btn {
    background: var(--variable-button-bg, var(--secondary-background-color));
    border: 1px solid var(--divider-color); border-radius: 6px;
    color: var(--primary-text-color); cursor: pointer; padding: 4px 10px;
    font-size: 0.82rem; font-weight: bold; display: flex; align-items: center; transition: all 0.2s;
  }
  .add-trigger-btn:hover, .io-btn:hover {
    background: var(--card-background-color); border-color: var(--accent-color); color: var(--accent-color);
  }

  .summary-box {
    display: none; background: var(--secondary-background-color); border-radius: 6px; padding: 10px;
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 10px; border: 1px solid var(--divider-color); margin-bottom: 6px;
  }
  .summary-box.visible { display: grid; }
  .summary-item { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 500; }
  .summary-item ha-icon { --mdc-icon-size: 18px; }
  
  .controls { display: none; gap: 8px; align-items: center; }
  .controls.visible { display: flex; }
  .search-bar { display: none; flex: 1; padding: 6px 10px; border-radius: 20px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
  .search-bar.visible { display: block; }
  .sort-select { display: none; padding: 6px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
  .sort-select.visible { display: block; }
  
  .inventory-grid { display: none; gap: var(--grid-gap); margin-top: 10px; }
  .inventory-grid.visible { display: grid; }
  
  .item-card { 
    background: var(--secondary-background-color); border-radius: 8px; padding: 6px 8px; 
    display: flex; flex-direction: column; justify-content: flex-start; gap: 6px; 
    position: relative; border: 1px solid transparent; min-height: 70px; transition: background-color 0.2s ease; 
  }
  .item-name { font-weight: 500; font-size: 0.9rem; margin-bottom: 2px; word-break: break-word; }
  .item-meta { font-size: 0.75rem; color: var(--secondary-text-color); margin-bottom: 0px; }
  .item-actions { display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.12); border-radius: 4px; padding: 2px; }
  .item-actions button { background: transparent; border: none; color: var(--primary-text-color); cursor: pointer; font-weight: bold; width: 26px; height: 26px; font-size: 1.1rem; }
  .qty-display { font-weight: bold; font-size: 0.9rem; }
  .btn-delete { color: var(--error-color, #db4437) !important; }

  .edit-icon-btn { position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: var(--secondary-text-color); cursor: pointer; padding: 2px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; z-index: 2; }
  .edit-icon-btn ha-icon { --mdc-icon-size: 16px; }

  .item-edit-form, .item-add-popup {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 90%; max-width: 550px; max-height: 85vh;
    background: var(--mdc-theme-surface, var(--card-background-color, #fff));
    border-radius: 12px; box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.25);
    border: 1px solid var(--divider-color); padding: 20px; z-index: 9999; box-sizing: border-box;
    display: flex; flex-direction: column; gap: 16px; overflow-y: auto; animation: popupFadeIn 0.15s ease-out;
  }
  .item-edit-form::before, .item-add-popup::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.45); z-index: -1; pointer-events: none; }
  @keyframes popupFadeIn { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }
  .popup-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
  .edit-field { display: flex; flex-direction: column; gap: 4px; }
  .edit-field label { font-size: 0.78rem; color: var(--secondary-text-color); font-weight: 600; }
  .edit-field input, .edit-field select { width: 100%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 6px; background: var(--card-background-color); color: var(--primary-text-color); box-sizing: border-box; font-size: 0.85rem; height: 34px; }
  .edit-field.full-width { grid-column: 1 / -1; }
  .edit-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--divider-color); padding-top: 12px; }
  .edit-form-actions button { padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; cursor: pointer; border: none; height: 36px; }
  .btn-save-edit { background: var(--accent-color); color: white; }
  .btn-cancel-edit { background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color) !important; }
`;