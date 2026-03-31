import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('riddhiDesk', {
  showNotification: (payload: { title: string; body: string; tag?: string }) =>
    ipcRenderer.invoke('notification:show', payload)
})

declare global {
  interface Window {
    riddhiDesk: {
      showNotification: (payload: {
        title: string
        body: string
        tag?: string
      }) => Promise<boolean>
    }
  }
}
