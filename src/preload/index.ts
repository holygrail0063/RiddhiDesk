import { contextBridge, ipcRenderer } from 'electron'

type NotificationAction = { type: 'task' | 'reminder'; id: string }
type DesktopGoogleAuthResult = { idToken: string; accessToken: string }

contextBridge.exposeInMainWorld('riddhiDesk', {
  startDesktopGoogleSignIn: () => ipcRenderer.invoke('auth:google-desktop-sign-in'),
  showNotification: (payload: {
    title: string
    body: string
    tag?: string
    action?: NotificationAction
  }) => ipcRenderer.invoke('notification:show', payload),

  onNotificationClick: (cb: (action: NotificationAction) => void) => {
    const fn = (_e: unknown, action: NotificationAction) => cb(action)
    ipcRenderer.on('notification:click', fn)
    return () => {
      ipcRenderer.removeListener('notification:click', fn)
    }
  }
})

declare global {
  interface Window {
    riddhiDesk: {
      showNotification: (payload: {
        title: string
        body: string
        tag?: string
        action?: NotificationAction
      }) => Promise<boolean>
      startDesktopGoogleSignIn: () => Promise<DesktopGoogleAuthResult>
      onNotificationClick: (cb: (action: NotificationAction) => void) => () => void
    }
  }
}
