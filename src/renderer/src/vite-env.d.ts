/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_ALLOWED_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type RiddhiDeskNotificationAction = { type: 'task' | 'reminder'; id: string }

interface Window {
  riddhiDesk?: {
    showNotification: (payload: {
      title: string
      body: string
      tag?: string
      action?: RiddhiDeskNotificationAction
    }) => Promise<boolean>
    onNotificationClick?: (cb: (action: RiddhiDeskNotificationAction) => void) => () => void
  }
}
