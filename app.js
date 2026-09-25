const MORNING_TASKS = [
  { section: 'PRE-SET UP', text: 'Clean and Refill lalagyan ng ice' },
  { section: 'PRE-SET UP', text: 'Clean the cooler.' },
  { section: 'PRE-SET UP', text: 'Prep Milk, 1 liter' },
  { section: 'PRE-SET UP', text: 'Hugas if meron' },
  { section: 'PRE-SET UP', text: 'I-aayos mga nahugasan kagabi' },
  { section: 'OUTSIDE', text: 'Magwalis' },
  { section: 'OUTSIDE', text: 'Check if may mga Tae at tanggalin' },
  { section: 'OUTSIDE', text: 'Clean chair and tables (Wipe with zonrox)' },
  { section: 'OUTSIDE', text: 'Change the garbage bins' },
  { section: 'CLEAN AND REFILL', text: 'Syrup area at 500ml only' },
  { section: 'CLEAN AND REFILL', text: 'Powder area' },
  { section: 'CLEAN AND REFILL', text: 'Clean the machines' },
  { section: 'CLEAN AND REFILL', text: 'Scrub the bar mats' },
  { section: 'CLEAN AND REFILL', text: 'Wash the wipes and dry them' },
  { section: 'CLEAN AND REFILL', text: 'Magwalis sa loob' },
  { section: 'CLEAN AND REFILL', text: 'Restock the cups, lids, straws' },
  { section: 'CLEAN AND REFILL', text: 'Magluto ng Siomai' },
  { section: 'CLEAN AND REFILL', text: 'Magluto ng Pearl' },
  { section: 'CLEAN AND REFILL', text: 'Mag-inventory' }
];

const EVENING_TASKS = [
  { section: 'OUTSIDE', text: 'Magwalis - Pick up trash' },
  { section: 'OUTSIDE', text: 'Check if may mga Tae at tanggalin' },
  { section: 'OUTSIDE', text: 'Clean chair and tables (Wipe with zonrox)' },
  { section: 'OUTSIDE', text: 'Change the garbage bins' },
  { section: 'OUTSIDE', text: 'Set up camping chairs' },
  { section: 'INSIDE', text: 'Magluto Pearl if wala pa' },
  { section: 'INSIDE', text: 'Magluto ng Siomai. Maintain 10-15 pcs' },
  { section: 'INSIDE', text: 'Restocking' },
  { section: 'INSIDE', text: 'Baka may ice cream sa labas' },
  { section: 'INSIDE', text: 'Clean inside' },
  { section: 'INSIDE', text: 'Order stocks' },
  { section: 'CLOSING @ 10:30 PM', text: 'Maghugas' },
  { section: 'CLOSING @ 10:30 PM', text: 'Clean the Prep Area' },
  { section: 'CLOSING @ 10:30 PM', text: 'Clean the machines' },
  { section: 'CLOSING @ 10:30 PM', text: 'Check the cooler' },
  { section: 'CLOSING @ 10:30 PM', text: 'Siomai in Fridge' },
  { section: 'CLOSING @ 10:30 PM', text: 'Ice Creams' },
  { section: 'CLOSING @ 10:30 PM', text: 'Mga saksakan' },
  { section: 'CLOSING @ 10:30 PM', text: 'Unplug the logo' },
  { section: 'CLOSING @ 10:30 PM', text: 'Check the locks.' },
  { section: 'CLOSING @ 10:30 PM', text: 'Fuse' }
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
  toast: document.querySelector('#toast'),
  photoModal: document.querySelector('#photoModal'),
  largePhoto: document.querySelector('#largePhoto'),
  closePhotoModal: document.querySelector('#closePhotoModal'),
  cameraModal: document.querySelector('#cameraModal'),
  closeCameraModal: document.querySelector('#closeCameraModal'),
  cameraVideo: document.querySelector('#cameraVideo'),
  cameraCanvas: document.querySelector('#cameraCanvas'),
  capturePhotoBtn: document.querySelector('#capturePhotoBtn'),
  cameraFallbackInput: document.querySelector('#cameraFallbackInput'),
  cameraStatus: document.querySelector('#cameraStatus')
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
    if (index === 0 || item.section !== items[index - 1].section) {
      const heading = document.createElement('h3');
      heading.className = 'section-heading';
      heading.textContent = item.section || '';
      els.list.appendChild(heading);
    }
    const node = els.template.content.cloneNode(true);
    const card = node.querySelector('.task');
    const number = node.querySelector('.task-number');
    const title = node.querySelector('.task-title');
    const note = node.querySelector('.task-note');
    const meta = node.querySelector('.task-meta');
    const doneBtn = node.querySelector('.done-btn');
    const photoInput = node.querySelector('.photo-input');
    const takePhotoBtn = node.querySelector('.take-photo-btn');
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
        const objectUrl = URL.createObjectURL(blob);
        photoPreview.src = objectUrl;
        photoPreview.onload = () => URL.revokeObjectURL(objectUrl);
      });
    }

    doneBtn.addEventListener('click', () => toggleDone(index));
    takePhotoBtn.addEventListener('click', () => openCamera(index));
    photoInput.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) savePhoto(index, file);
      e.target.value = '';
    });
    photoPreview.addEventListener('click', () => openSavedPhoto(item.photoId));
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
async function preparePhoto(file) {
  // Compress large camera images before saving so the local browser quota lasts much longer.
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image.');
  const bitmap = await createImageBitmap(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return await new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not process photo.')), 'image/jpeg', 0.78);
  });
}

async function savePhoto(index, file) {
  try {
    const items = currentItems();
    if (items[index].photoId) await deleteBlob(items[index].photoId);
    const id = `${key()}__${index}__${Date.now()}`;
    const compressed = await preparePhoto(file);
    await saveBlob(id, compressed);
    items[index].photoId = id;
    items[index].photoTimestamp = new Date().toISOString();
    writeItems(items);
    render();
    showToast('Photo saved on this device');
  } catch (error) {
    console.error(error);
    showToast('Could not save photo. Try another photo.');
  }
}

let activeCameraTask = null;
let cameraStream = null;

async function openCamera(index) {
  activeCameraTask = index;
  els.cameraModal.classList.remove('hidden');
  els.cameraStatus.textContent = 'Starting camera…';
  els.capturePhotoBtn.disabled = true;
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera API unavailable');
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    els.cameraVideo.srcObject = cameraStream;
    await els.cameraVideo.play();
    els.capturePhotoBtn.disabled = false;
    els.cameraStatus.textContent = 'Point the camera at the completed task and tap Capture.';
  } catch (error) {
    console.error(error);
    els.cameraStatus.textContent = 'Camera access was not available. Use “Choose from device” below.';
    els.capturePhotoBtn.disabled = true;
  }
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  els.cameraVideo.srcObject = null;
  els.cameraModal.classList.add('hidden');
  activeCameraTask = null;
  els.cameraFallbackInput.value = '';
}

async function capturePhoto() {
  if (activeCameraTask === null || !cameraStream) return;
  const video = els.cameraVideo;
  const canvas = els.cameraCanvas;
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.78));
  const taskIndex = activeCameraTask;
  closeCamera();
  if (blob) await savePhoto(taskIndex, blob);
}

async function openSavedPhoto(photoId) {
  if (!photoId) return;
  const blob = await loadPhoto(photoId);
  if (!blob) { showToast('Saved photo could not be found'); return; }
  const url = URL.createObjectURL(blob);
  els.largePhoto.src = url;
  els.largePhoto.onload = () => {
    if (els.largePhoto.dataset.url && els.largePhoto.dataset.url !== url) URL.revokeObjectURL(els.largePhoto.dataset.url);
    els.largePhoto.dataset.url = url;
  };
  els.photoModal.classList.remove('hidden');
}

function closeSavedPhoto() {
  const url = els.largePhoto.dataset.url;
  if (url) URL.revokeObjectURL(url);
  els.largePhoto.dataset.url = '';
  els.largePhoto.src = '';
  els.photoModal.classList.add('hidden');
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

els.closePhotoModal.addEventListener('click', closeSavedPhoto);
els.photoModal.querySelector('.photo-modal-backdrop').addEventListener('click', closeSavedPhoto);
els.closeCameraModal.addEventListener('click', closeCamera);
els.cameraModal.querySelector('.camera-modal-backdrop').addEventListener('click', closeCamera);
els.capturePhotoBtn.addEventListener('click', capturePhoto);
els.cameraFallbackInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (file && activeCameraTask !== null) {
    const taskIndex = activeCameraTask;
    closeCamera();
    savePhoto(taskIndex, file);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSavedPhoto();
    closeCamera();
  }
});

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
