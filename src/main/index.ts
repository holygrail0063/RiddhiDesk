import { app, BrowserWindow, ipcMain, Notification, shell } from 'electron'
import fs from 'fs'
import path from 'path'

let mainWindow: BrowserWindow | null = null

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
    webPreferences: {
      preload: preloadPath(),
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

ipcMain.handle(
  'notification:show',
  (_event, payload: { title: string; body: string; tag?: string }) => {
    if (!Notification.isSupported()) {
      return false
    }
    const n = new Notification({
      title: payload.title,
      body: payload.body,
      silent: false
    })
    n.show()
    return true
  }
)
