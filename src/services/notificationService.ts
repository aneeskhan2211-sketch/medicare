import { toast } from 'sonner';
import { messaging, VAPID_KEY, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initMessaging(userId?: string) {
    if (!messaging) return;

    try {
      const isGranted = await this.requestPermission();
      if (!isGranted) return;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log('FCM Token:', token);
        if (userId) {
          await this.saveTokenToFirestore(userId, token);
        }
      }

      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        this.send(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: payload.notification?.icon,
        });
        toast.info(payload.notification?.title || 'Notification', {
          description: payload.notification?.body
        });
      });
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  }

  private async saveTokenToFirestore(userId: string, token: string) {
    const tokenPath = `users/${userId}/push_tokens/${token}`;
    try {
      await setDoc(doc(db, tokenPath), {
        token,
        userId,
        platform: 'web',
        lastUpdated: serverTimestamp(),
        isActive: true
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, tokenPath);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  send(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  sendCritical(title: string, body: string) {
    this.send(title, {
      body,
      tag: 'critical-alert',
      requireInteraction: true,
      silent: false,
    });
    toast.error(title, { description: body });
  }

  sendTip(tip: string) {
    this.send('Health Tip', {
      body: tip,
      tag: 'health-tip',
    });
    toast.info('Health Tip', { description: tip });
  }

  sendReminder(title: string, body: string) {
    this.send(title, {
      body,
      tag: 'reminder',
      requireInteraction: true,
    });
  }
}

export const notificationService = NotificationService.getInstance();
