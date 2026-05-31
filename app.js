// ============================================================
// AnimalTrack — App Controller
// ============================================================

const App = (() => {
  let currentTab     = 'animals';
  let selectedAnimal = null;
  let historyAnimal  = null;
  let simInterval    = null;
  let simSpeed       = 8000;
  let _simRunning    = false;

  // expose for UI renderer check
  Object.defineProperty(window, 'App', { get: () => _api, configurable: true });

  // ── Boot ──────────────────────────────────────────────────
  function boot() {
    MapModule.init('map', selectAnimal);
    _renderSidebar('animals');
    _updateAlertBadge();
    startSim();

    // keyboard shortcut: Escape closes detail
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDetail();
    });
  }

  // ── Tab routing ───────────────────────────────────────────
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
    _renderSidebar(tab);
    if (tab !== 'animals') closeDetail();
  }

  function _renderSidebar(tab) {
    const el = document.getElementById('sidebar-content');
    if (!el) return;
    const renders = {
      animals:   () => UI.renderAnimalList(selectedAnimal),
      alerts:    () => UI.renderAlerts(),
      history:   () => UI.renderHistory(historyAnimal || selectedAnimal),
      geofences: () => UI.renderGeofences(),
      register:  () => UI.renderForm(null),
      settings:  () => UI.renderSettings(),
    };
    el.innerHTML = (renders[tab] || renders.animals)();
  }

  // ── Animal selection ──────────────────────────────────────
  function selectAnimal(id) {
    selectedAnimal = id;
    MapModule.flyTo(id);
    document.getElementById('detail-panel').innerHTML = UI.renderDetail(id);
    document.getElementById('detail-panel').classList.add('show');
    if (currentTab === 'animals') _renderSidebar('animals');
  }

  function closeDetail() {
    selectedAnimal = null;
    document.getElementById('detail-panel').classList.remove('show');
    if (currentTab === 'animals') _renderSidebar('animals');
  }

  function filterAnimals(q) {
    UI.filterAnimalCards(q, selectedAnimal);
  }

  // ── CRUD ──────────────────────────────────────────────────
  function editAnimal(id) {
    currentTab = 'register';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === 'register'));
    document.getElementById('sidebar-content').innerHTML = UI.renderForm(id);
  }

  function cancelForm() {
    switchTab(currentTab === 'register' ? 'animals' : currentTab);
  }

  function submitForm(id) {
    const get = field => document.getElementById(field)?.value?.trim();
    const name  = get('f-name');
    const owner = get('f-owner');
    if (!name || !owner) { Utils.toast('Name and Owner are required', 'error'); return; }

    const data = {
      name, owner,
      species:   get('f-species'),
      breed:     get('f-breed'),
      age:       get('f-age'),
      contact:   get('f-contact'),
      device_id: get('f-device'),
      status:    get('f-status'),
      battery:   get('f-battery'),
    };

    if (id) {
      DB.updateAnimal(id, data);
      MapModule.refreshMarker(id);
      Utils.toast(`${name} updated`);
      selectAnimal(id);
    } else {
      const a = DB.addAnimal(data);
      MapModule.addNewAnimalMarker(a.id);
      Utils.toast(`${name} registered!`);
      selectAnimal(a.id);
    }
    switchTab('animals');
  }

  function deleteAnimal(id) {
    const a = DB.getAnimal(id);
    if (!a) return;
    Utils.confirm(`Delete ${a.emoji} ${a.name}? This cannot be undone.`, () => {
      DB.deleteAnimal(id);
      MapModule.removeAnimalMarker(id);
      closeDetail();
      switchTab('animals');
      Utils.toast(`${a.name} removed`);
    });
  }

  function markMissing(id) {
    const a = DB.getAnimal(id);
    if (!a) return;
    const newStatus = a.status === 'missing' ? 'active' : 'missing';
    DB.updateAnimal(id, { status: newStatus });
    if (newStatus === 'missing') {
      DB.addAlert({ type:'danger', icon:'🚨', animal_id: id, title:`${a.name} marked as missing`, detail:'Manually flagged by operator' });
      _updateAlertBadge();
    }
    MapModule.refreshMarker(id);
    selectAnimal(id);
    Utils.toast(newStatus === 'missing' ? `${a.name} flagged as missing` : `${a.name} marked found`);
  }

  // ── Alerts ────────────────────────────────────────────────
  function readAlert(id) {
    const al = DB.alerts.find(a => a.id === id);
    if (al) al.read = true;
    _updateAlertBadge();
    if (currentTab === 'alerts') _renderSidebar('alerts');
    if (al?.animal_id) selectAnimal(al.animal_id);
  }

  function markAllRead() {
    DB.alerts.forEach(a => a.read = true);
    _updateAlertBadge();
    _renderSidebar('alerts');
  }

  function _updateAlertBadge() {
    const n = DB.unreadAlerts();
    const badge = document.getElementById('alert-badge');
    if (badge) {
      badge.textContent = n;
      badge.style.display = n ? 'flex' : 'none';
    }
  }

  // ── History ───────────────────────────────────────────────
  function viewHistory(id) {
    historyAnimal = id;
    switchTab('history');
  }

  function switchHistoryAnimal(id) {
    historyAnimal = id;
    document.getElementById('sidebar-content').innerHTML = UI.renderHistory(id);
  }

  function flyToPoint(lat, lng) {
    const map = MapModule;
    // just fly map to coordinates
    document.dispatchEvent(new CustomEvent('flyToCoords', { detail: { lat, lng } }));
  }

  function exportHistory(id) {
    const a = DB.getAnimal(id);
    if (!a || !a.history.length) { Utils.toast('No history to export', 'error'); return; }
    const rows = [['Animal','Latitude','Longitude','Timestamp'],
      ...a.history.map(h => [a.name, h.lat, h.lng, h.timestamp])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${a.name}_history.csv`; link.click();
    URL.revokeObjectURL(url);
    Utils.toast('CSV exported');
  }

  // ── Geofences ─────────────────────────────────────────────
  function showAddGeofence() {
    document.getElementById('add-geofence-form').style.display = 'block';
  }

  function saveGeofence() {
    const name   = document.getElementById('gf-name')?.value?.trim();
    const lat    = parseFloat(document.getElementById('gf-lat')?.value);
    const lng    = parseFloat(document.getElementById('gf-lng')?.value);
    const radius = parseInt(document.getElementById('gf-radius')?.value);
    if (!name || isNaN(lat) || isNaN(lng)) { Utils.toast('Fill in all geofence fields', 'error'); return; }
    const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];
    DB.geofences.push({ id: Date.now(), name, lat, lng, radius: radius||300, color: colors[DB.geofences.length % colors.length], active: true });
    MapModule.refreshGeofences();
    _renderSidebar('geofences');
    Utils.toast('Geofence added');
  }

  function toggleGeofence(id) {
    const g = DB.geofences.find(x => x.id === id);
    if (g) g.active = !g.active;
    MapModule.refreshGeofences();
    _renderSidebar('geofences');
  }

  function deleteGeofence(id) {
    const idx = DB.geofences.findIndex(x => x.id === id);
    if (idx > -1) DB.geofences.splice(idx, 1);
    MapModule.refreshGeofences();
    _renderSidebar('geofences');
    Utils.toast('Geofence removed');
  }

  // ── Map controls ──────────────────────────────────────────
  function fitAll() { MapModule.fitAll(); }

  function toggleMapGeofences() {
    const on = MapModule.toggleGeofences();
    document.getElementById('btn-geofences')?.classList.toggle('active', on);
  }

  function toggleMapTrails() {
    const on = MapModule.toggleTrails();
    document.getElementById('btn-trails')?.classList.toggle('active', on);
  }

  // ── GPS Simulation ────────────────────────────────────────
  function startSim() {
    if (simInterval) clearInterval(simInterval);
    _simRunning = true;
    simInterval = setInterval(_simTick, simSpeed);
  }

  function _simTick() {
    const active = DB.animals.filter(a => a.status === 'active');
    if (!active.length) return;
    const a = active[Math.floor(Math.random() * active.length)];
    const newLat = a.lat + (Math.random() - 0.5) * 0.0004;
    const newLng = a.lng + (Math.random() - 0.5) * 0.0004;

    DB.pushLocation(a.id, newLat, newLng);
    MapModule.refreshMarker(a.id);

    // Geofence check
    DB.geofences.filter(g => g.active).forEach(g => {
      if (!Utils.insideGeofence(a, g)) {
        const existing = DB.alerts.find(al => al.animal_id === a.id && al.title.includes('left') && !al.read);
        if (!existing) {
          DB.addAlert({ type:'danger', icon:'🚨', animal_id: a.id, title:`${a.name} left ${g.name}`, detail:'Geofence breach detected' });
          _updateAlertBadge();
        }
      }
    });

    // Battery drain
    if (a.battery > 0) {
      a.battery = Math.max(0, a.battery - 0.1);
      if (Math.round(a.battery) === 20) {
        DB.addAlert({ type:'warn', icon:'🔋', animal_id: a.id, title:`${a.name} battery low`, detail:`${Math.round(a.battery)}% remaining` });
        _updateAlertBadge();
      }
    }

    if (selectedAnimal === a.id) {
      document.getElementById('detail-panel').innerHTML = UI.renderDetail(a.id);
      document.getElementById('detail-panel').classList.add('show');
    }
    if (currentTab === 'animals') _renderSidebar('animals');
  }

  function toggleSim() {
    if (_simRunning) {
      clearInterval(simInterval); simInterval = null; _simRunning = false;
    } else {
      startSim();
    }
    const sw = document.getElementById('sim-toggle');
    if (sw) sw.classList.toggle('on', _simRunning);
  }

  function setSimSpeed(ms) {
    simSpeed = ms;
    if (_simRunning) startSim();
  }

  function resetDemo() {
    Utils.confirm('Reset all data to demo? Current changes will be lost.', () => location.reload());
  }

  // ── Public ────────────────────────────────────────────────
  const _api = {
    get simRunning() { return _simRunning; },
    boot, switchTab, selectAnimal, closeDetail, filterAnimals,
    editAnimal, cancelForm, submitForm, deleteAnimal, markMissing,
    readAlert, markAllRead,
    viewHistory, switchHistoryAnimal, flyToPoint, exportHistory,
    showAddGeofence, saveGeofence, toggleGeofence, deleteGeofence,
    fitAll, toggleMapGeofences, toggleMapTrails,
    toggleSim, setSimSpeed, resetDemo,
  };
  return _api;
})();
