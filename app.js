const MORNING_TASKS = [
  { text: 'Magwalis ng Basura' },
  { text: 'Tapon ng basurahan' },
  { text: 'Sunugin basurahan' },
  { text: 'Set up ng tables' },
  { text: 'Punas ng tables', note: 'Clean the coolers, walang tubig dapat' },
  { text: 'Refill ng ice yung cooler' },
  { text: 'ilabas ang Espresso Machine' },
  { text: 'Check yung mga milk' },
  { text: 'Gawa ng milk (isang jug lang)' },
  { text: 'Check condensed, refill kung kunti na' },
  { text: 'Check evap, mag-open if wala na' },
  { text: 'Check creamer, gawa if wala na' },
  { text: 'Check nata, refill kung kunti na' },
  { text: 'Check the rainbow Jelly, refill kung kunti na' },
  { text: 'Check or magluto ng Pearls' },
  { text: 'Magluto ng Siomai (10 pcs)' },
  { text: 'Hugas if may huhugasin' },
  { text: 'Magrestock ng mga cups, straws at lids' },
  { text: 'Magrestock ng mga syrups' },
  { text: 'Maglaba ng punas' },
  { text: 'Magpunas ng mga baso' },
  { text: 'Linisin yung mga pumps' },
  { text: 'Magpunas ng mga lalagyan ng mga powders' },
  { text: 'Magwalis sa loob' },
  { text: 'Mag-inventory (Mon, Wed, Friday)' }
];

// The supplied evening list contains these five tasks.
const EVENING_TASKS = [
  { text: 'Magwalis ng Basura' },
  { text: 'Tapon ng basurahan' },
  { text: 'Sunugin basurahan' },
  { text: 'Set up ng tables' },
  { text: 'Punas ng tables' }
];

const state = {
  shift: 'morning',
  date: todayKey(),
  data: loadState()
};

const els = {
  date: document.querySelector('#workDate'),
  morning: document.querySelector('#morningTab'),
  evening: document.querySelector('#eveningTab'),
  list: document.querySelector('#taskList'),
  progressText: document.querySelector('#progressText'),
  progressPercent: document.querySelector('#progressPercent'),
  progressBar: document.querySelector('#progressBar'),
  reset: document.querySelector('#resetBtn'),
  install: document.querySelector('#installBtn'),
  template: document.querySelector('#taskTemplate'),
  toast: document.querySelector('#toast')
};

let deferredInstallPrompt = null;

function todayKey() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function key() { return `${state.date}__${state.shift}`; }
function tasks() { return state.shift === 'morning' ? MORNING_TASKS : EVENING_TASKS; }

function loadState() {
  try { return JSON.parse(localStorage.getItem('shiftChecklistV1') || '{}'); }
  catch { return {}; }
}
function saveState() { localStorage.setItem('shiftChecklistV1', JSON.stringify(state.data)); }

function currentItems() {
  const taskCount = tasks().length;
  const existing = state.data[key()] || [];
  return tasks().map((task, i) => ({
    ...task,
    ...(existing[i] || {}),
    done: Boolean(existing[i]?.done),
    photoId: existing[i]?.photoId || null,
    timestamp: existing[i]?.timestamp || null,
    photoTimestamp: existing[i]?.photoTimestamp || null
  })).slice(0, taskCount);
}

function writeItems(items) {
  state.data[key()] = items;
  saveState();
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function render() {
  const items = currentItems();
  els.list.innerHTML = '';
  items.forEach((item, index) => {
    const node = els.template.content.cloneNode(true);
    const card = node.querySelector('.task');
    const number = node.querySelector('.task-number');
    const title = node.querySelector('.task-title');
    const note = node.querySelector('.task-note');
    const meta = node.querySelector('.task-meta');
    const doneBtn = node.querySelector('.done-btn');
    const photoInput = node.querySelector('.photo-input');
    const photoArea = node.querySelector('.photo-area');
    const photoPreview = node.querySelector('.photo-preview');
    const removePhoto = node.querySelector('.remove-photo');

    number.textContent = item.done ? '✓' : String(index + 1);
    title.textContent = item.text;
    if (item.note) { note.textContent = item.note; note.classList.remove('hidden'); }
    if (item.done) {
      card.classList.add('completed');
      doneBtn.textContent = 'Done ✓';
      if (item.timestamp) { meta.textContent = `Completed: ${formatTime(item.timestamp)}`; meta.classList.remove('hidden'); }
    } else {
      doneBtn.textContent = 'Done';
    }

    if (item.photoId) {
      photoArea.classList.remove('hidden');
      loadPhoto(item.photoId).then(blob => {
        if (!blob) return;
        photoPreview.src = URL.createObjectURL(blob);
        photoPreview.onload = () => URL.revokeObjectURL(photoPreview.src);
      });
    }

    doneBtn.addEventListener('click', () => toggleDone(index));
    photoInput.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) savePhoto(index, file);
    });
    removePhoto.addEventListener('click', () => deletePhoto(index));
    els.list.appendChild(node);
  });
  updateProgress(items);
}

function updateProgress(items) {
  const done = items.filter(i => i.done).length;
  const total = items.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  els.progressText.textContent = `${done} / ${total} tasks done`;
  els.progressPercent.textContent = `${pct}%`;
  els.progressBar.style.width = `${pct}%`;
}

function toggleDone(index) {
  const items = currentItems();
  items[index].done = !items[index].done;
  items[index].timestamp = items[index].done ? new Date().toISOString() : null;
  writeItems(items);
  render();
  showToast(items[index].done ? 'Task marked done' : 'Task marked as not done');
}

function switchShift(shift) {
  state.shift = shift;
  els.morning.classList.toggle('active', shift === 'morning');
  els.evening.classList.toggle('active', shift === 'evening');
  els.morning.setAttribute('aria-selected', String(shift === 'morning'));
  els.evening.setAttribute('aria-selected', String(shift === 'evening'));
  render();
}

els.date.value = state.date;
els.date.addEventListener('change', e => {
  state.date = e.target.value || todayKey();
  render();
});
els.morning.addEventListener('click', () => switchShift('morning'));
els.evening.addEventListener('click', () => switchShift('evening'));
els.reset.addEventListener('click', async () => {
  if (!confirm(`Reset all ${tasks().length} ${state.shift} tasks for ${state.date}?`)) return;
  const items = currentItems();
  for (const item of items) if (item.photoId) await deleteBlob(item.photoId);
  delete state.data[key()];
  saveState();
  render();
  showToast('Checklist reset');
});

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 1800);
}

const DB_NAME = 'shiftChecklistPhotos';
const STORE = 'photos';
let dbPromise;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
async function saveBlob(id, blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
async function loadPhoto(id) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}
async function deleteBlob(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  } catch {}
}
async function savePhoto(index, file) {
  const items = currentItems();
  if (items[index].photoId) await deleteBlob(items[index].photoId);
  const id = `${key()}__${index}__${Date.now()}`;
  await saveBlob(id, file);
  items[index].photoId = id;
  items[index].photoTimestamp = new Date().toISOString();
  writeItems(items);
  render();
  showToast('Photo saved on this device');
}
async function deletePhoto(index) {
  const items = currentItems();
  if (!items[index].photoId) return;
  await deleteBlob(items[index].photoId);
  items[index].photoId = null;
  items[index].photoTimestamp = null;
  writeItems(items);
  render();
  showToast('Photo removed');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  els.install.classList.remove('hidden');
});
els.install.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.install.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

render();
