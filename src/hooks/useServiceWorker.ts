import { useCallback, useEffect, useRef } from 'react';

export function useServiceWorker() {
  const registered = useRef(false);

  const register = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    if (registered.current) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registered.current = true;
      return registration;
    } catch (err) {
      console.warn('SW registration failed:', err);
      return null;
    }
  }, []);

  const getPushSubscription = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }, []);

  const subscribeToPush = useCallback(async (applicationServerKey: Uint8Array) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup not needed — SW persists across sessions
    };
  }, []);

  return { register, getPushSubscription, subscribeToPush, unsubscribeFromPush };
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}