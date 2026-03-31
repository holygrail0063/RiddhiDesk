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

## Windows Packaging
- Run `npm run package:win` to build a Windows installer.
- Packaged files are written to the `release` directory.
- Required env values before packaging:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_ALLOWED_EMAIL`
  - `GOOGLE_DESKTOP_CLIENT_ID`
- Optional Windows icon:
  - put `icon.ico` in `build/icon.ico` before packaging if you want a custom app icon.
