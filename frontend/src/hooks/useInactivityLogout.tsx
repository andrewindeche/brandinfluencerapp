import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { authStore } from '@/rxjs/authStore';

const INACTIVITY_LIMIT = 20 * 60 * 1000;
const WARNING_TIME = 1 * 60 * 1000;

export function useInactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const logoutUser = useCallback(() => {
    localStorage.setItem('manual-logout', Date.now().toString());
    authStore.logout();
    router.push('/login');
  }, [router]);

  const resetTimer = useCallback(() => {
    localStorage.setItem('last-activity', Date.now().toString());

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    setShowWarning(false);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_LIMIT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      logoutUser();
    }, INACTIVITY_LIMIT);
  }, [logoutUser]);

  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer),
    );
    resetTimer();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'manual-logout') {
        authStore.logout();
        router.push('/login');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  useEffect(() => {
    if (!showWarning) return;
    const cancelWarning = () => resetTimer();
    const cancelEvents = ['mousemove', 'keydown', 'click'];
    cancelEvents.forEach((event) =>
      window.addEventListener(event, cancelWarning),
    );
    return () =>
      cancelEvents.forEach((event) =>
        window.removeEventListener(event, cancelWarning),
      );
  }, [showWarning, resetTimer]);

  return { showWarning };
}
