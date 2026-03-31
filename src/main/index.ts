import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import { startDesktopGoogleSignIn, type DesktopGoogleAuthResult } from './googleDesktopAuth'

let mainWindow: BrowserWindow | null = null

function windowIconPath(): string | undefined {
  const candidates = [
    path.join(app.getAppPath(), 'build', 'icon.png'),
    path.join(process.resourcesPath, 'icon.png'),
    path.join(process.resourcesPath, 'build', 'icon.png')
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function isAuthPopupUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    const href = u.href.toLowerCase()

    // Google OAuth pages
    if (host === 'accounts.google.com') return true

    // Firebase auth handler hosted on your firebaseapp.com domain
    if (href.includes('/__/auth/')) return true

    // Some flows may use googleusercontent for embedded assets/frames
    if (host.endsWith('.googleusercontent.com')) return true

    return false
  } catch {
    return false
  }
}

function preloadPath(): string {
  const base = path.join(__dirname, '../preload')
  const mjs = path.join(base, 'index.mjs')
  const js = path.join(base, 'index.js')
  if (fs.existsSync(mjs)) return mjs
  return js
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: '#fdfcfa',
    icon: windowIconPath(),
    webPreferences: {
      preload: preloadPath(),
      // ESM preload in this app requires unsandboxed preload execution.
      // Without this, Electron may fail loading preload with
      // "Cannot use import statement outside a module".
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Allow Firebase/Google auth popups to open inside the app.
    if (isAuthPopupUrl(details.url)) {
      return { action: 'allow' }
    }

    // Everything else opens in the user's default browser.
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

type NotificationAction = { type: 'task' | 'reminder'; id: string }

ipcMain.handle(
  'auth:google-desktop-sign-in',
  async (): Promise<DesktopGoogleAuthResult> => {
    const result = await startDesktopGoogleSignIn()
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
    return result
  }
)

ipcMain.handle(
  'notification:show',
  (
    _event,
    payload: {
      title: string
      body: string
      tag?: string
      action?: NotificationAction
    }
  ) => {
    if (!Notification.isSupported()) {
      return false
    }
    const action = payload.action
    const n = new Notification({
      title: payload.title,
      body: payload.body,
      silent: false
    })
    n.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show()
        mainWindow.focus()
        if (action) {
          mainWindow.webContents.send('notification:click', action)
        }
      }
    })
    n.show()
    return true
  }
)
