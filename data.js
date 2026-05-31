// ============================================================
// AnimalTrack — Central Data Store
// Replace this with fetch() calls to your backend API later
// ============================================================

const DB = {
  animals: [
    {
      id: 1, name: 'Bella', species: 'Dog', breed: 'Labrador Retriever',
      age: 3, owner: 'Maria Santos', contact: 'maria@example.com',
      device_id: 'TRACKER-001', emoji: '🐕', color: '#3b82f6',
      status: 'active', battery: 82, photo: null,
      lat: 14.5995, lng: 120.9842,
      history: [
        { lat: 14.5995, lng: 120.9842, timestamp: '2025-05-31 09:42:00' },
        { lat: 14.5985, lng: 120.9830, timestamp: '2025-05-31 09:15:00' },
        { lat: 14.5970, lng: 120.9820, timestamp: '2025-05-31 08:50:00' },
        { lat: 14.5960, lng: 120.9810, timestamp: '2025-05-31 08:20:00' },
        { lat: 14.5950, lng: 120.9800, timestamp: '2025-05-31 07:55:00' },
      ]
    },
    {
      id: 2, name: 'Thunder', species: 'Horse', breed: 'Arabian',
      age: 6, owner: 'Jose Rivera', contact: 'jose@example.com',
      device_id: 'TRACKER-002', emoji: '🐎', color: '#f59e0b',
      status: 'active', battery: 55, photo: null,
      lat: 14.6020, lng: 120.9820,
      history: [
        { lat: 14.6020, lng: 120.9820, timestamp: '2025-05-31 09:40:00' },
        { lat: 14.6010, lng: 120.9835, timestamp: '2025-05-31 09:10:00' },
        { lat: 14.6000, lng: 120.9850, timestamp: '2025-05-31 08:40:00' },
        { lat: 14.6015, lng: 120.9860, timestamp: '2025-05-31 08:10:00' },
      ]
    },
    {
      id: 3, name: 'Shadow', species: 'Cat', breed: 'Siamese',
      age: 2, owner: 'Ana Cruz', contact: 'ana@example.com',
      device_id: 'TRACKER-003', emoji: '🐈', color: '#8b5cf6',
      status: 'missing', battery: 23, photo: null,
      lat: 14.5940, lng: 120.9870,
      history: [
        { lat: 14.5940, lng: 120.9870, timestamp: '2025-05-31 08:30:00' },
        { lat: 14.5950, lng: 120.9860, timestamp: '2025-05-31 07:45:00' },
        { lat: 14.5965, lng: 120.9850, timestamp: '2025-05-31 07:00:00' },
      ]
    },
    {
      id: 4, name: 'Rex', species: 'Dog', breed: 'German Shepherd',
      age: 4, owner: 'Carlos Mendez', contact: 'carlos@example.com',
      device_id: 'TRACKER-004', emoji: '🐕', color: '#10b981',
      status: 'active', battery: 91, photo: null,
      lat: 14.6005, lng: 120.9800,
      history: [
        { lat: 14.6005, lng: 120.9800, timestamp: '2025-05-31 09:38:00' },
        { lat: 14.6000, lng: 120.9790, timestamp: '2025-05-31 09:20:00' },
        { lat: 14.5990, lng: 120.9785, timestamp: '2025-05-31 08:55:00' },
      ]
    },
    {
      id: 5, name: 'Goldie', species: 'Cow', breed: 'Holstein',
      age: 5, owner: 'Farm Unit A', contact: 'farm@example.com',
      device_id: 'TRACKER-005', emoji: '🐄', color: '#ec4899',
      status: 'offline', battery: 0, photo: null,
      lat: 14.6035, lng: 120.9855,
      history: [
        { lat: 14.6035, lng: 120.9855, timestamp: '2025-05-31 06:10:00' },
        { lat: 14.6030, lng: 120.9845, timestamp: '2025-05-31 05:45:00' },
      ]
    },
  ],

  geofences: [
    { id: 1, name: 'Farm North Pen',      lat: 14.6020, lng: 120.9830, radius: 350, color: '#3b82f6', active: true },
    { id: 2, name: 'Farm East Boundary',  lat: 14.5960, lng: 120.9860, radius: 450, color: '#ef4444', active: true },
    { id: 3, name: 'Grazing Zone A',      lat: 14.6005, lng: 120.9795, radius: 280, color: '#10b981', active: true },
  ],

  alerts: [
    { id: 1, type: 'danger', icon: '🚨', animal_id: 3, title: 'Shadow left designated area',    detail: 'Geofence breach — Farm East boundary',         time: '2025-05-31 08:32:00', read: false },
    { id: 2, type: 'warn',   icon: '🔋', animal_id: 3, title: 'Shadow battery critical',        detail: 'Battery at 23% — device may stop transmitting', time: '2025-05-31 08:30:00', read: false },
    { id: 3, type: 'warn',   icon: '📡', animal_id: 5, title: 'Goldie tracker offline',          detail: 'No signal for 3h 28min',                        time: '2025-05-31 06:10:00', read: true  },
    { id: 4, type: 'info',   icon: '📍', animal_id: 2, title: 'Thunder moved 1.2 km',           detail: 'Unusual movement pattern detected',              time: '2025-05-31 07:50:00', read: true  },
  ],

  users: [
    { id: 1, username: 'admin', role: 'admin',    name: 'Admin User'   },
    { id: 2, username: 'staff', role: 'caretaker', name: 'Farm Staff'  },
  ],

  // ── helpers ──────────────────────────────────────────────
  nextId(collection) {
    return Math.max(0, ...this[collection].map(x => x.id)) + 1;
  },

  getAnimal(id) {
    return this.animals.find(a => a.id === id) || null;
  },

  addAnimal(data) {
    const emojis = { Dog:'🐕', Cat:'🐈', Horse:'🐎', Cow:'🐄', Goat:'🐐', Sheep:'🐑', Bird:'🦜', Other:'🐾' };
    const colors  = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#6366f1','#14b8a6','#f97316'];
    const animal  = {
      id:        this.nextId('animals'),
      name:      data.name,
      species:   data.species,
      breed:     data.breed || data.species,
      age:       parseInt(data.age) || 0,
      owner:     data.owner,
      contact:   data.contact || '',
      device_id: data.device_id || `TRACKER-${String(this.nextId('animals')).padStart(3,'0')}`,
      emoji:     emojis[data.species] || '🐾',
      color:     colors[this.animals.length % colors.length],
      status:    'offline',
      battery:   0,
      photo:     data.photo || null,
      lat:       14.598 + (Math.random() - 0.5) * 0.01,
      lng:       120.984 + (Math.random() - 0.5) * 0.01,
      history:   [],
    };
    this.animals.push(animal);
    return animal;
  },

  updateAnimal(id, data) {
    const idx = this.animals.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.animals[idx] = { ...this.animals[idx], ...data };
    return this.animals[idx];
  },

  deleteAnimal(id) {
    const idx = this.animals.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.animals.splice(idx, 1);
    return true;
  },

  pushLocation(animal_id, lat, lng) {
    const a = this.getAnimal(animal_id);
    if (!a) return null;
    const entry = { lat, lng, timestamp: new Date().toISOString().replace('T',' ').slice(0,19) };
    a.lat = lat;
    a.lng = lng;
    a.history.unshift(entry);
    if (a.history.length > 100) a.history.pop();
    return entry;
  },

  addAlert(data) {
    const alert = { id: this.nextId('alerts'), read: false, time: new Date().toISOString().replace('T',' ').slice(0,19), ...data };
    this.alerts.unshift(alert);
    return alert;
  },

  unreadAlerts() {
    return this.alerts.filter(a => !a.read).length;
  },
};
