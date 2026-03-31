# RiddhiDesk
Riddhis Desk Planner

## Web Commands
- `npm run dev:web`: starts the local web app in development mode.
- `npm run preview:web`: serves the built web output for local preview.
- `npm run build:web`: only builds static files into `dist/web` (does not open a browser).

## Firebase Env Setup
- Web uses the Firebase web config from root-level `.env.local` / `.env` via Vite.
- Electron also reads the same Firebase web config for the renderer, and additionally needs `GOOGLE_DESKTOP_CLIENT_ID` for desktop Google sign-in.
- After changing any env values, fully stop and restart the dev server or Electron app so the new values are picked up.
