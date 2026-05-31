# 🐾 AnimalTrack — GPS Animal Monitoring System

A fully client-side MVP built with vanilla HTML, CSS, and JavaScript.
No build tools, no frameworks, no backend required to run.

## Project Structure

```
animaltrack/
├── index.html          # Entry point — open this in a browser
├── css/
│   └── style.css       # All styles (dark theme)
└── js/
    ├── data.js         # Mock database + CRUD helpers
    ├── utils.js        # Shared utility functions
    ├── map.js          # Leaflet map module
    ├── ui.js           # All panel/page renderers
    └── app.js          # App controller — wires everything
```

## How to Run

Just open `index.html` in any modern browser.
No server needed. No install. No build step.

For a local dev server (optional, avoids CORS on future API calls):
```bash
npx serve .
# or
python3 -m http.server 8080
```

## Features

| Feature | Status |
|---|---|
| Animal registration (name, species, breed, age, owner, device ID) | ✅ |
| Animal list with search/filter | ✅ |
| Status tracking (Active / Missing / Offline) | ✅ |
| Dark map with GPS markers | ✅ |
| Click marker → animal detail panel | ✅ |
| Location history table + CSV export | ✅ |
| Geofence zones with breach detection | ✅ |
| Alert system (geofence, battery, offline) | ✅ |
| Live GPS simulation (random movement) | ✅ |
| Battery drain simulation | ✅ |
| Edit & delete animals | ✅ |
| Mark animal as Missing / Found | ✅ |
| Trail overlay (movement paths) | ✅ |

## Adding MySQL Later

When you're ready to connect a backend:

1. Replace the `DB` object in `js/data.js` with `fetch()` calls to your API
2. Example swap for `DB.animals`:
   ```js
   // Before (mock):
   DB.animals  // in-memory array

   // After (API):
   async function getAnimals() {
     const res = await fetch('/api/animals');
     return res.json();
   }
   ```
3. All business logic stays in `app.js` — only the data layer changes

## Suggested API Endpoints (for future backend)

```
GET    /api/animals              → list all
POST   /api/animals              → register new
PUT    /api/animals/:id          → update
DELETE /api/animals/:id          → delete
POST   /api/animals/:id/location → push GPS coords
GET    /api/animals/:id/history  → location history
GET    /api/alerts               → list alerts
GET    /api/geofences            → list geofences
POST   /api/geofences            → add geofence
```

## Tech Stack

- **Map:** Leaflet.js (CDN)
- **Tiles:** CartoDB Dark Matter
- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **No frameworks** — pure vanilla JS modules pattern
