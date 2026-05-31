// ============================================================
// AnimalTrack — UI Renderers
// ============================================================

const UI = (() => {

  // ── Animal List ───────────────────────────────────────────
  function renderAnimalList(selectedId = null) {
    const active  = DB.animals.filter(a => a.status === 'active').length;
    const missing = DB.animals.filter(a => a.status === 'missing').length;
    const offline = DB.animals.filter(a => a.status === 'offline').length;

    return `
      <div class="stats-row">
        <div class="stat-card"><div class="stat-num" style="color:#10b981">${active}</div><div class="stat-label">Active</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#ef4444">${missing}</div><div class="stat-label">Missing</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#64748b">${offline}</div><div class="stat-label">Offline</div></div>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="animal-search" placeholder="Search animals…" oninput="App.filterAnimals(this.value)">
      </div>
      <div id="animal-cards">
        ${_animalCards(DB.animals, selectedId)}
      </div>`;
  }

  function _animalCards(list, selectedId) {
    if (!list.length) return `<div class="empty-state">No animals found</div>`;
    return list.map(a => {
      const sc = Utils.statusColor(a.status);
      const ago = a.history[0] ? Utils.timeAgo(a.history[0].timestamp) : 'No data';
      const battColor = Utils.batteryColor(a.battery);
      return `
        <div class="animal-card ${selectedId === a.id ? 'selected' : ''}" data-id="${a.id}" onclick="App.selectAnimal(${a.id})">
          <div class="animal-card-top">
            <div class="avatar" style="background:${a.color}22;border:1.5px solid ${a.color}44">${a.emoji}</div>
            <div class="animal-info">
              <div class="animal-name">${a.name}</div>
              <div class="animal-meta">${a.breed} · ${a.age}yr · ${a.owner}</div>
            </div>
            <div class="status-pill" style="background:${sc}22;color:${sc};border:1px solid ${sc}44">${Utils.statusLabel(a.status)}</div>
          </div>
          <div class="animal-card-foot">
            <span class="coord-text">📍 ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</span>
            <span class="meta-right">
              <span style="color:${battColor}">${a.battery}%</span>
              <span class="dot-sep">·</span>
              <span>${ago}</span>
            </span>
          </div>
          ${a.battery > 0 && a.battery < 25 ? `<div class="low-battery-bar">🔋 Low battery — ${a.battery}%</div>` : ''}
        </div>`;
    }).join('');
  }

  function filterAnimalCards(query, selectedId) {
    const q = query.toLowerCase();
    const list = DB.animals.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.species.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q) ||
      a.owner.toLowerCase().includes(q)
    );
    const el = document.getElementById('animal-cards');
    if (el) el.innerHTML = _animalCards(list, selectedId);
  }

  // ── Animal Detail Panel ───────────────────────────────────
  function renderDetail(animalId) {
    const a = DB.getAnimal(animalId);
    if (!a) return '';
    const sc = Utils.statusColor(a.status);
    const bc = Utils.batteryColor(a.battery);
    const ago = a.history[0] ? Utils.timeAgo(a.history[0].timestamp) : 'No data';
    return `
      <div class="detail-header">
        <div class="detail-avatar" style="background:${a.color}22;border:1.5px solid ${a.color}44">${a.emoji}</div>
        <div class="detail-title-block">
          <div class="detail-name">${a.name}</div>
          <div class="detail-sub">${a.breed} · ${a.species}</div>
        </div>
        <div class="detail-status-badge" style="background:${sc}22;color:${sc};border:1px solid ${sc}44">${Utils.statusLabel(a.status)}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><div class="di-label">Age</div><div class="di-value">${a.age} years</div></div>
        <div class="detail-item"><div class="di-label">Device</div><div class="di-value">${a.device_id}</div></div>
        <div class="detail-item"><div class="di-label">Battery</div><div class="di-value" style="color:${bc}">${a.battery}%</div></div>
        <div class="detail-item"><div class="di-label">Last ping</div><div class="di-value">${ago}</div></div>
        <div class="detail-item detail-item-full"><div class="di-label">Owner</div><div class="di-value">${a.owner} ${a.contact ? '· '+a.contact : ''}</div></div>
        <div class="detail-item detail-item-full">
          <div class="di-label">GPS Coordinates</div>
          <div class="di-value mono">${a.lat.toFixed(6)}, ${a.lng.toFixed(6)}</div>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-sm btn-ghost" onclick="App.editAnimal(${a.id})">✏️ Edit</button>
        <button class="btn btn-sm btn-ghost" onclick="App.viewHistory(${a.id})">📋 History</button>
        <button class="btn btn-sm btn-ghost" onclick="App.markMissing(${a.id})">${a.status === 'missing' ? '✅ Found' : '🚨 Missing'}</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="App.deleteAnimal(${a.id})">🗑 Delete</button>
      </div>`;
  }

  // ── Alerts ────────────────────────────────────────────────
  function renderAlerts() {
    const unread = DB.alerts.filter(a => !a.read);
    const read   = DB.alerts.filter(a =>  a.read);
    const typeColors = { danger:'#ef4444', warn:'#f59e0b', info:'#3b82f6' };

    const renderGroup = (items, label) => `
      <div class="alert-group-label">${label}</div>
      ${items.map(al => {
        const animal = DB.getAnimal(al.animal_id);
        const tc = typeColors[al.type] || '#64748b';
        return `
          <div class="alert-item ${al.read ? 'read' : ''}" onclick="App.readAlert(${al.id})">
            <div class="alert-icon-wrap" style="background:${tc}22;border:1px solid ${tc}44">${al.icon}</div>
            <div class="alert-body">
              <div class="alert-title">${al.title}</div>
              <div class="alert-detail">${al.detail}</div>
              <div class="alert-foot">
                ${animal ? `<span class="alert-animal">${animal.emoji} ${animal.name}</span>` : ''}
                <span class="alert-time">${Utils.timeAgo(al.time)}</span>
              </div>
            </div>
            ${!al.read ? '<div class="unread-dot"></div>' : ''}
          </div>`;
      }).join('')}`;

    return `
      <div class="alerts-header">
        <span>${DB.alerts.length} total · <strong>${unread.length} unread</strong></span>
        <button class="btn btn-sm btn-ghost" onclick="App.markAllRead()">Mark all read</button>
      </div>
      ${unread.length ? renderGroup(unread, 'New') : ''}
      ${read.length   ? renderGroup(read, 'Earlier') : ''}
      ${!DB.alerts.length ? '<div class="empty-state">🎉 No alerts</div>' : ''}`;
  }

  // ── Location History ──────────────────────────────────────
  function renderHistory(animalId) {
    const a = DB.getAnimal(animalId) || DB.animals[0];
    if (!a) return '<div class="empty-state">No animals registered</div>';

    const rows = a.history.map((h, i) => `
      <tr onclick="App.flyToPoint(${h.lat},${h.lng})">
        <td>${i + 1}</td>
        <td>${a.emoji} ${a.name}</td>
        <td class="mono">${h.lat.toFixed(5)}, ${h.lng.toFixed(5)}</td>
        <td>${Utils.formatTimestamp(h.timestamp)}</td>
      </tr>`).join('');

    return `
      <div class="history-controls">
        <select class="form-input sm" onchange="App.switchHistoryAnimal(parseInt(this.value))">
          ${DB.animals.map(an => `<option value="${an.id}" ${an.id===a.id?'selected':''}>${an.emoji} ${an.name}</option>`).join('')}
        </select>
        <input type="date" class="form-input sm" id="hist-date" placeholder="Filter date">
        <button class="btn btn-sm btn-ghost" onclick="App.exportHistory(${a.id})">⬇ CSV</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Animal</th><th>Coordinates</th><th>Timestamp</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--text3)">No history</td></tr>'}</tbody>
        </table>
      </div>
      <div class="history-summary">
        ${a.history.length} location points · ${a.name} · click a row to zoom on map
      </div>`;
  }

  // ── Register / Edit Form ──────────────────────────────────
  function renderForm(animalId = null) {
    const a = animalId ? DB.getAnimal(animalId) : null;
    const v = (field, fallback = '') => a ? (a[field] ?? fallback) : fallback;
    const species = ['Dog','Cat','Horse','Cow','Goat','Sheep','Bird','Other'];

    return `
      <div class="form-title">${a ? `✏️ Edit — ${a.name}` : '➕ Register New Animal'}</div>
      <div class="form-grid">
        <div class="form-group form-span2">
          <label class="form-label">Animal Name *</label>
          <input class="form-input" id="f-name" placeholder="e.g. Buddy" value="${v('name')}">
        </div>
        <div class="form-group">
          <label class="form-label">Species *</label>
          <select class="form-input" id="f-species">
            ${species.map(s => `<option ${v('species')===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Age (years)</label>
          <input class="form-input" id="f-age" type="number" min="0" placeholder="e.g. 3" value="${v('age')}">
        </div>
        <div class="form-group form-span2">
          <label class="form-label">Breed</label>
          <input class="form-input" id="f-breed" placeholder="e.g. Labrador Retriever" value="${v('breed')}">
        </div>
        <div class="form-group form-span2">
          <label class="form-label">Owner / Caretaker *</label>
          <input class="form-input" id="f-owner" placeholder="Full name" value="${v('owner')}">
        </div>
        <div class="form-group form-span2">
          <label class="form-label">Contact</label>
          <input class="form-input" id="f-contact" placeholder="Email or phone" value="${v('contact')}">
        </div>
        <div class="form-group form-span2">
          <label class="form-label">GPS Device ID</label>
          <input class="form-input" id="f-device" placeholder="e.g. TRACKER-006" value="${v('device_id')}">
        </div>
        ${a ? `
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input" id="f-status">
            ${['active','offline','missing'].map(s=>`<option ${v('status')===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Battery %</label>
          <input class="form-input" id="f-battery" type="number" min="0" max="100" value="${v('battery')}">
        </div>` : ''}
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="App.cancelForm()">Cancel</button>
        <button class="btn btn-primary" onclick="App.submitForm(${a ? a.id : 'null'})">${a ? 'Save Changes' : 'Register Animal'}</button>
      </div>`;
  }

  // ── Geofences ─────────────────────────────────────────────
  function renderGeofences() {
    return `
      <div class="section-header">
        <span>Geofence Zones</span>
        <button class="btn btn-sm btn-primary" onclick="App.showAddGeofence()">+ Add Zone</button>
      </div>
      ${DB.geofences.map(g => `
        <div class="geofence-card">
          <div class="gf-color" style="background:${g.color}"></div>
          <div class="gf-info">
            <div class="gf-name">${g.name}</div>
            <div class="gf-meta">${g.lat.toFixed(4)}, ${g.lng.toFixed(4)} · radius ${g.radius}m</div>
          </div>
          <div class="gf-actions">
            <div class="toggle-sw ${g.active?'on':''}" onclick="App.toggleGeofence(${g.id})">
              <div class="toggle-knob"></div>
            </div>
            <button class="btn btn-xs btn-danger-ghost" onclick="App.deleteGeofence(${g.id})">✕</button>
          </div>
        </div>`).join('')}
      ${!DB.geofences.length ? '<div class="empty-state">No geofences defined</div>' : ''}
      <div id="add-geofence-form" style="display:none" class="geofence-add-form">
        <div class="form-group">
          <label class="form-label">Zone Name</label>
          <input class="form-input" id="gf-name" placeholder="e.g. Pen A">
        </div>
        <div class="form-grid" style="grid-template-columns:1fr 1fr">
          <div class="form-group">
            <label class="form-label">Latitude</label>
            <input class="form-input" id="gf-lat" placeholder="14.5995" type="number" step="any">
          </div>
          <div class="form-group">
            <label class="form-label">Longitude</label>
            <input class="form-input" id="gf-lng" placeholder="120.9842" type="number" step="any">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Radius (meters)</label>
          <input class="form-input" id="gf-radius" type="number" value="300" min="50">
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('add-geofence-form').style.display='none'">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="App.saveGeofence()">Save Zone</button>
        </div>
      </div>`;
  }

  // ── Settings ──────────────────────────────────────────────
  function renderSettings() {
    return `
      <div class="settings-section">
        <div class="settings-title">Simulation</div>
        <div class="settings-row">
          <div>
            <div class="settings-label">Live GPS Simulation</div>
            <div class="settings-desc">Randomly move active animals every few seconds</div>
          </div>
          <div class="toggle-sw ${App.simRunning?'on':''}" id="sim-toggle" onclick="App.toggleSim()"><div class="toggle-knob"></div></div>
        </div>
        <div class="settings-row">
          <div class="settings-label">Simulation Speed</div>
          <select class="form-input sm" id="sim-speed" onchange="App.setSimSpeed(parseInt(this.value))">
            <option value="3000">Fast (3s)</option>
            <option value="8000" selected>Normal (8s)</option>
            <option value="15000">Slow (15s)</option>
          </select>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">Map</div>
        <div class="settings-row">
          <div class="settings-label">Default zoom level</div>
          <select class="form-input sm">
            <option>14</option><option selected>15</option><option>16</option>
          </select>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">Demo Data</div>
        <div class="settings-row">
          <button class="btn btn-ghost" onclick="App.resetDemo()">🔄 Reset to Demo Data</button>
        </div>
      </div>`;
  }

  return { renderAnimalList, filterAnimalCards, renderDetail, renderAlerts, renderHistory, renderForm, renderGeofences, renderSettings };
})();
