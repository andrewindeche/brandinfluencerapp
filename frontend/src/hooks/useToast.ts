import { useState, useCallback, useEffect } from 'react';

export function useToast(timeout = 4000) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | null;
  } | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      if (timer) clearTimeout(timer);

      const newTimer = setTimeout(() => {
        setToast(null);
      }, timeout);

      setTimer(newTimer);
    },
    [timeout, timer],
  );

  const closeToast = useCallback(() => {
    if (timer) clearTimeout(timer);
    setToast(null);
  }, [timer]);

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  return { toast, showToast, closeToast };
}
