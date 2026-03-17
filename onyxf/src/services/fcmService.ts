// src/services/fcmService.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

const firebaseConfig = {
  apiKey: "AIzaSyBfx-oLKiCBA-Fjd-jKx3Nux7eIGUVp8KU",
  authDomain: "onyx-7d458.firebaseapp.com",
  projectId: "onyx-7d458",
  storageBucket: "onyx-7d458.firebasestorage.app",
  messagingSenderId: "705861744706",
  appId: "1:705861744706:web:168f1a4f16a8dff38c15db",
  measurementId: "G-KLZK1JQZM5"
};

const VAPID_KEY = "BJUq2IhdUy1NXw3V-E4eHpxb4maix32CpYmqyJY26fgODJJQ0i2MOcSfNkqMClPkw4LxKE7F7NfDldjdwZlpBlI";

let messaging: Messaging | null = null;

try {
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export async function requestNotificationPermission(userId: string): Promise<string | null> {
  if (!messaging) {
    console.error('Firebase messaging not initialized');
    return null;
  }

  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('✅ FCM Token:', token);
        await saveFCMToken(userId, token);
        return token;
      } else {
        console.log('❌ No registration token available');
        return null;
      }
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied');
      toast.error('Please enable notifications in your browser settings');
      return null;
    } else {
      console.log('⚠️ Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id: userId,
        token: token,
        device_type: 'web',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,token'
      });

    if (error) throw error;
    console.log('✅ FCM token saved to database');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

export async function deleteFCMToken(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('✅ FCM token deleted');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
}

// Simple callback-based message listener (no JSX)
export function listenForMessages(callback: (payload: any) => void): void {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    callback(payload);
  });
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function areNotificationsEnabled(): boolean {
  return getNotificationPermission() === 'granted';
}