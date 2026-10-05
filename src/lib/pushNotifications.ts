// Push Notification Utilities
// Uses Web Push API for real-time agent alerts

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export const isPushSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isPushSupported()) return 'unsupported';
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const showLocalNotification = async (payload: PushNotificationPayload): Promise<boolean> => {
  if (!isPushSupported()) return false;
  
  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return false;
  }
  
  try {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to relevant section if data provided
      if (payload.data?.route) {
        window.location.hash = payload.data.route;
      }
    };
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

// Subscribe to agent activity notifications
export const subscribeToAgentNotifications = (
  onNotification: (payload: PushNotificationPayload) => void
) => {
  // This would connect to a real-time channel in production
  // For now, we'll set up the interface for future implementation
  console.log('Subscribed to agent notifications');
  
  return () => {
    console.log('Unsubscribed from agent notifications');
  };
};
