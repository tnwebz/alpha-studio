import { useSyncExternalStore, useCallback } from 'react';

const ADMIN_STORAGE_KEY = 'isAdmin';
const ADMIN_EVENT_NAME = 'alpha-admin-auth-change';

function subscribe(callback: () => void) {
  window.addEventListener(ADMIN_EVENT_NAME, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(ADMIN_EVENT_NAME, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return false;
}

export function useAdmin() {
  const isAdmin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback((password: string) => {
    if (password === '111') {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      window.dispatchEvent(new Event(ADMIN_EVENT_NAME));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event(ADMIN_EVENT_NAME));
  }, []);

  return { isAdmin, login, logout };
}
