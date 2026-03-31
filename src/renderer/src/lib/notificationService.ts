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

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.riddhiDesk?.showNotification) {
    return false
  }
  return true
}

export async function showDesktopNotification(
  payload: DesktopNotificationPayload
): Promise<boolean> {
  const { title, body, tag, action } = payload

  if (typeof window !== 'undefined' && window.riddhiDesk?.showNotification) {
    return window.riddhiDesk.showNotification({ title, body, tag, action })
  }
  return false
}
