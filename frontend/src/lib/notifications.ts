import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'appointment' | 'case' | 'document' | 'payment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class NotificationManager {
  private socket: Socket | null = null;
  private notifications: Notification[] = [];

  constructor() {
    this.initializeSocket();
    this.registerServiceWorker();
  }

  private async initializeSocket() {
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: localStorage.getItem('auth_token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification server');
    });

    this.socket.on('notification', (notification: Notification) => {
      this.handleNotification(notification);
    });
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      } catch (error) {
        console.error('Error registering service worker:', error);
      }
    }
  }

  private handleNotification(notification: Notification) {
    // Add to local storage
    this.notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(this.notifications));

    // Show toast notification
    toast(notification.message, {
      icon: this.getNotificationIcon(notification.type),
      duration: this.getNotificationDuration(notification.priority)
    });

    // Trigger system notification if allowed
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png'
      });
    }
  }

  private getNotificationIcon(type: Notification['type']) {
    switch (type) {
      case 'appointment': return '📅';
      case 'case': return '⚖️';
      case 'document': return '📄';
      case 'payment': return '💰';
      default: return '🔔';
    }
  }

  private getNotificationDuration(priority: Notification['priority']) {
    switch (priority) {
      case 'high': return 10000;
      case 'medium': return 5000;
      case 'low': return 3000;
      default: return 5000;
    }
  }

  public getNotifications() {
    return this.notifications;
  }

  public clearNotifications() {
    this.notifications = [];
    localStorage.removeItem('notifications');
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const notificationManager = new NotificationManager();