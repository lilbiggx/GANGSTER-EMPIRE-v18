/**
 * Web Notification Utility for browser push-style alerts.
 */

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  
  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
}

export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        icon: "/icon.svg",
        badge: "/icon.svg",
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }
}
