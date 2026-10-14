import assert from 'node:assert/strict';
import test from 'node:test';
import { filterAndSortItems } from '../src/simple-inventory-filters.js';
import {
  handleAddItemService,
  handleSaveEditService
} from '../src/simple-inventory-services.js';
import {
  getAddPopupHtml,
  getEditFormHtml
} from '../src/simple-inventory-templates.js';

function makeCard(items, options = {}) {
  return {
    _hass: { language: 'it' },
    inventoryItems: items,
    searchQuery: options.searchQuery || '',
    currentSort: options.currentSort,
    config: options.config || {}
  };
}

function dateAtOffset(daysFromToday) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  if (date.getTimezoneOffset() > 0) date.setDate(date.getDate() + 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function makeServiceCard({ values = {}, items = [] } = {}) {
  const elements = new Map(
    Object.entries(values).map(([id, value]) => [id, value])
  );
  const calls = [];
  const card = {
    shadowRoot: { getElementById: id => elements.get(id) || null },
    config: { entity: 'sensor.inventory' },
    _hass: {
      language: 'it',
      states: {
        'sensor.inventory': { attributes: { inventory_id: 'inventory-1', items } }
      },
      callService: async (...args) => calls.push(args)
    },
    _items: items,
    fetchCount: 0,
    fetchInventoryItems() {
      this.fetchCount += 1;
    }
  };
  return { card, calls };
}

const templateLang = new Proxy({}, { get: (_target, key) => String(key) });

test('ordina alfabeticamente senza modificare la lista originale', () => {
  const items = [{ name: 'Pera' }, { name: 'Arancia' }];

  const result = filterAndSortItems(makeCard(items));

  assert.deepEqual(result.map(item => item.name), ['Arancia', 'Pera']);
  assert.deepEqual(items.map(item => item.name), ['Pera', 'Arancia']);
});

test('cerca per nome e barcode, inclusi barcode_id e barcode strutturati', () => {
  const items = [
    { name: 'Caffè', barcode: 'ABC-123' },
    { name: 'Farina', barcode_id: { code: 'XYZ-456' } },
    { name: 'Riso', barcode: 'NO-MATCH' }
  ];

  assert.deepEqual(
    filterAndSortItems(makeCard(items, { searchQuery: 'caffè' })).map(item => item.name),
    ['Caffè']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, { searchQuery: 'xyz-456' })).map(item => item.name),
    ['Farina']
  );
});

test('filtra disponibilità, soglie quantità, categoria e posizione', () => {
  const items = [
    { name: 'Avena', quantity: 1, auto_add_to_list_quantity: 2, category: 'Colazione', location: 'Dispensa' },
    { name: 'Biscotti', quantity: 0, auto_add_to_list_quantity: 1, category: 'Colazione', location: 'Dispensa' },
    { name: 'Ceci', quantity: 3, category: 'Scatolame', location: 'Mensola' }
  ];

  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'alpha_avail' })).map(item => item.name),
    ['Avena', 'Ceci']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'alert_qty_0' })).map(item => item.name),
    ['Biscotti']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'cat_Colazione' })).map(item => item.name),
    ['Avena']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'loc_Mensola' })).map(item => item.name),
    ['Ceci']
  );
});

test('seleziona articoli scaduti e in scadenza entro soglia', () => {
  const items = [
    { name: 'Scaduto', quantity: 1, expiry_date: dateAtOffset(-1) },
    { name: 'Oggi', quantity: 1, expiry_date: dateAtOffset(0) },
    { name: 'Tra dieci giorni', quantity: 1, expiry_date: dateAtOffset(10) },
    { name: 'Tra undici giorni', quantity: 1, expiry_date: dateAtOffset(11) },
    { name: 'Senza scadenza', quantity: 1 },
    { name: 'Esaurito', quantity: 0, expiry_date: dateAtOffset(1) }
  ];

  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'alert_exp_expired' })).map(item => item.name),
    ['Scaduto']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'alert_exp_10d' })).map(item => item.name),
    ['Oggi', 'Tra dieci giorni']
  );
  assert.deepEqual(
    filterAndSortItems(makeCard(items, {
      currentSort: 'alert_exp_30d',
      config: { days_30d: 11 }
    })).map(item => item.name),
    ['Oggi', 'Tra dieci giorni', 'Tra undici giorni']
  );
});

test('usa la soglia personale per ordinare i prodotti in scadenza', () => {
  const items = [
    { name: 'Presto', quantity: 1, expiry_date: dateAtOffset(2), expiry_alert_days: 2 },
    { name: 'Più avanti', quantity: 1, expiry_date: dateAtOffset(4), expiry_alert_days: 2 },
    { name: 'Nessuna scorta', quantity: 0, expiry_date: dateAtOffset(1) }
  ];

  assert.deepEqual(
    filterAndSortItems(makeCard(items, { currentSort: 'expiring_soon_desc' })).map(item => item.name),
    ['Presto']
  );
});

test('rifiuta nome vuoto e aggiunta automatica senza lista To-Do', async t => {
  const originalAlert = globalThis.alert;
  const alerts = [];
  globalThis.alert = message => alerts.push(message);
  t.after(() => {
    if (originalAlert === undefined) delete globalThis.alert;
    else globalThis.alert = originalAlert;
  });

  const emptyName = makeServiceCard({ values: { 'new-name': { value: '  ' } } });
  await handleAddItemService(emptyName.card);
  assert.equal(emptyName.calls.length, 0);

  const missingTodo = makeServiceCard({
    values: {
      'new-name': { value: 'Caffè' },
      new_auto_add_checkbox: { checked: true }
    }
  });
  await handleAddItemService(missingTodo.card);
  assert.equal(missingTodo.calls.length, 0);
  assert.equal(alerts.length, 2);
});

test('incrementa la quantità quando nome, unità e scadenza coincidono', async () => {
  const existing = { name: 'Caffè', quantity: 2, unit: 'busta', expiry_date: '2030-01-01' };
  const { card, calls } = makeServiceCard({
    items: [existing],
    values: {
      'new-name': { value: ' Caffè ' },
      'new-qty': { value: '3' },
      new_unit: { value: ' BUSTA ' },
      new_expiry: { value: '2030-01-01' }
    }
  });

  await handleAddItemService(card);

  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], 'update_item');
  assert.equal(calls[0][2].desired_quantity, 5);
  assert.equal(calls[0][2].old_name, 'Caffè');
  assert.equal(card.fetchCount, 1);
});

test('crea un articolo distinto se unità o scadenza differiscono', async () => {
  const { card, calls } = makeServiceCard({
    items: [{ name: 'Tè', quantity: 1, unit: 'scatola', expiry_date: '2030-01-01' }],
    values: {
      'new-name': { value: 'Tè' },
      'new-qty': { value: '2' },
      new_unit: { value: 'busta' },
      new_expiry: { value: '2030-02-01' }
    }
  });

  await handleAddItemService(card);

  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], 'add_item');
  assert.equal(calls[0][2].name, 'Tè (busta - 2030-02-01)');
  assert.equal(calls[0][2].quantity, 2);
});

test('salva i valori del form di modifica nel servizio corretto', async () => {
  const { card, calls } = makeServiceCard({
    values: {
      edit_name: { value: '  Riso integrale  ' },
      edit_qty: { value: '4.5' },
      edit_expiry: { value: '2030-03-04' },
      edit_unit: { value: ' confezione ' },
      edit_cat_select: { value: 'Dispensa' },
      edit_price: { value: '2.75' }
    }
  });

  await handleSaveEditService(card, 'item-1', 'Riso');

  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], 'update_item');
  assert.equal(calls[0][2].old_name, 'Riso');
  assert.equal(calls[0][2].name, 'Riso integrale');
  assert.equal(calls[0][2].desired_quantity, 4.5);
  assert.equal(calls[0][2].expiry_date, '2030-03-04');
  assert.equal(calls[0][2].unit, 'confezione');
  assert.equal(calls[0][2].category, 'Dispensa');
  assert.equal(calls[0][2].price, 2.75);
});

test('genera i campi e i valori iniziali corretti per il form di aggiunta', () => {
  const html = getAddPopupHtml(templateLang, ['Dispensa'], {
    todoLists: [{ entity_id: 'todo.shopping', name: 'Spesa' }]
  });

  assert.match(html, /id="new-name" value=""/);
  assert.match(html, /id="new-qty" value="1"/);
  assert.match(html, /id="new_cat_select"/);
  assert.match(html, /value="Dispensa"/);
  assert.match(html, /value="todo\.shopping"/);
  assert.match(html, /id="new_auto_add_checkbox"/);
});

test('precompila il form di modifica e seleziona categoria e To-Do', () => {
  const html = getEditFormHtml({
    id: 'item-1',
    name: 'Riso',
    quantity: 2,
    category: 'Dispensa',
    auto_add_id_to_description_enabled: true,
    todo_list: 'todo.shopping',
    todo_quantity_placement: 'description'
  }, templateLang, ['Dispensa'], {
    todoLists: [{ entity_id: 'todo.shopping', name: 'Spesa' }]
  });

  assert.match(html, /id="edit_name" value="Riso"/);
  assert.match(html, /id="edit_qty" value="2"/);
  assert.match(html, /value="Dispensa" selected/);
  assert.match(html, /id="edit_auto_add_checkbox" checked/);
  assert.match(html, /value="todo\.shopping" selected/);
  assert.match(html, /value="description" selected/);
});