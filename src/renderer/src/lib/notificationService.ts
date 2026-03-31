export async function showDesktopNotification(
  title: string,
  body: string,
  tag?: string
): Promise<boolean> {
  if (typeof window !== 'undefined' && window.riddhiDesk?.showNotification) {
    return window.riddhiDesk.showNotification({ title, body, tag })
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body, tag })
    return true
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      new Notification(title, { body, tag })
      return true
    }
  }
  return false
}
