export type NotificationAction = {
  type: 'task' | 'reminder'
  id: string
}

export type DesktopNotificationPayload = {
  title: string
  body: string
  tag?: string
  action?: NotificationAction
}

function dispatchWebAction(action: NotificationAction): void {
  window.dispatchEvent(
    new CustomEvent<NotificationAction>('riddhidesk:notification-action', { detail: action })
  )
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const p = await Notification.requestPermission()
  return p === 'granted'
}

export async function showDesktopNotification(
  payload: DesktopNotificationPayload
): Promise<boolean> {
  const { title, body, tag, action } = payload

  if (typeof window !== 'undefined' && window.riddhiDesk?.showNotification) {
    return window.riddhiDesk.showNotification({ title, body, tag, action })
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const n = new Notification(title, { body, tag })
    if (action) {
      n.onclick = () => {
        window.focus()
        dispatchWebAction(action)
        n.close()
      }
    }
    return true
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      const n = new Notification(title, { body, tag })
      if (action) {
        n.onclick = () => {
          window.focus()
          dispatchWebAction(action)
          n.close()
        }
      }
      return true
    }
  }
  return false
}
