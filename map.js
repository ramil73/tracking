// ============================================================
// AnimalTrack — Map Module (Leaflet.js)
// ============================================================

const MapModule = (() => {
  let map, markers = {}, trailLayers = {}, geofenceCircles = [];
  let showTrails = false, showGeofences = true;
  let onSelectAnimal = null;

  function init(containerId, onSelect) {
    onSelectAnimal = onSelect;

    map = L.map(containerId, {
      zoomControl: false,
      attributionControl: false,
    }).setView([14.598, 120.984], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    DB.animals.forEach(a => _addMarker(a));
    DB.geofences.forEach(g => _addGeofence(g));
    DB.animals.forEach(a => _addTrail(a));

    return map;
  }

  function _makeIcon(animal) {
    const sc = Utils.statusColor(animal.status);
    const pulse = animal.status === 'missing' ? 'animation:pulse 1s infinite;' : '';
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:40px;height:40px">
        <div style="width:40px;height:40px;border-radius:50%;background:${animal.color}22;border:2.5px solid ${animal.color};
          display:flex;align-items:center;justify-content:center;font-size:19px;cursor:pointer;
          box-shadow:0 2px 14px ${animal.color}55;transition:transform .15s">${animal.emoji}</div>
        <div style="position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;
          background:${sc};border:2px solid #0f1117;${pulse}"></div>
      </div>`,
      iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -22],
    });
  }

  function _addMarker(animal) {
    const m = L.marker([animal.lat, animal.lng], { icon: _makeIcon(animal) }).addTo(map);
    m.on('click', () => onSelectAnimal && onSelectAnimal(animal.id));
    m.bindTooltip(animal.name, { permanent: false, direction: 'top', className: 'map-tooltip' });
    markers[animal.id] = m;
  }

  function _addGeofence(fence) {
    const c = L.circle([fence.lat, fence.lng], {
      radius: fence.radius,
      color: fence.color,
      fillColor: fence.color,
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: '6 5',
    });
    if (showGeofences && fence.active) c.addTo(map);
    c.bindTooltip(fence.name, { className: 'map-tooltip' });
    geofenceCircles.push({ fence, circle: c });
  }

  function _addTrail(animal) {
    if (animal.history.length < 2) return;
    const pts = animal.history.map(h => [h.lat, h.lng]);
    const line = L.polyline(pts, {
      color: animal.color, weight: 2, opacity: 0.55, dashArray: '5 4',
    });
    trailLayers[animal.id] = line;
    if (showTrails) line.addTo(map);
  }

  // ── Public API ─────────────────────────────────────────────

  function refreshMarker(animalId) {
    const a = DB.getAnimal(animalId);
    if (!a) return;
    if (markers[animalId]) {
      markers[animalId].setLatLng([a.lat, a.lng]);
      markers[animalId].setIcon(_makeIcon(a));
    } else {
      _addMarker(a);
    }
    // Update trail
    if (trailLayers[animalId]) map.removeLayer(trailLayers[animalId]);
    _addTrail(a);
    if (showTrails && trailLayers[animalId]) trailLayers[animalId].addTo(map);
  }

  function addNewAnimalMarker(animalId) {
    const a = DB.getAnimal(animalId);
    if (a) _addMarker(a);
  }

  function removeAnimalMarker(animalId) {
    if (markers[animalId]) { map.removeLayer(markers[animalId]); delete markers[animalId]; }
    if (trailLayers[animalId]) { map.removeLayer(trailLayers[animalId]); delete trailLayers[animalId]; }
  }

  function flyTo(animalId, zoom = 17) {
    const a = DB.getAnimal(animalId);
    if (a) map.flyTo([a.lat, a.lng], zoom, { duration: 0.8 });
  }

  function fitAll() {
    if (!DB.animals.length) return;
    const pts = DB.animals.map(a => [a.lat, a.lng]);
    map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
  }

  function toggleGeofences() {
    showGeofences = !showGeofences;
    geofenceCircles.forEach(({ fence, circle }) => {
      if (showGeofences && fence.active) circle.addTo(map);
      else map.removeLayer(circle);
    });
    return showGeofences;
  }

  function toggleTrails() {
    showTrails = !showTrails;
    Object.entries(trailLayers).forEach(([, line]) => {
      if (showTrails) line.addTo(map);
      else map.removeLayer(line);
    });
    return showTrails;
  }

  function refreshGeofences() {
    geofenceCircles.forEach(({ circle }) => map.removeLayer(circle));
    geofenceCircles = [];
    DB.geofences.forEach(g => _addGeofence(g));
  }

  return { init, refreshMarker, addNewAnimalMarker, removeAnimalMarker, flyTo, fitAll, toggleGeofences, toggleTrails, refreshGeofences };
})();
