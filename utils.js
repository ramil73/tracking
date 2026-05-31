// ============================================================
// AnimalTrack — Utility Functions
// ============================================================

const Utils = {
  formatTimestamp(ts) {
    if (!ts) return 'N/A';
    const d = new Date(ts.replace(' ', 'T'));
    return d.toLocaleString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  },

  timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts.replace(' ','T')).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  },

  batteryColor(pct) {
    if (pct === 0)  return '#64748b';
    if (pct < 20)   return '#ef4444';
    if (pct < 50)   return '#f59e0b';
    return '#10b981';
  },

  batteryIcon(pct) {
    if (pct === 0)  return '🪫';
    if (pct < 20)   return '🔋';
    return '🔋';
  },

  statusColor(s) {
    return { active:'#10b981', missing:'#ef4444', offline:'#64748b' }[s] || '#64748b';
  },

  statusLabel(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  // Haversine distance in meters
  distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  },

  // Check if animal is inside a geofence circle
  insideGeofence(animal, fence) {
    return this.distanceMeters(animal.lat, animal.lng, fence.lat, fence.lng) <= fence.radius;
  },

  toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
  },

  confirm(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <p>${msg}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" id="conf-cancel">Cancel</button>
          <button class="btn btn-danger" id="conf-ok">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#conf-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#conf-ok').onclick = () => { overlay.remove(); onConfirm(); };
  },

  debounce(fn, ms = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
};
