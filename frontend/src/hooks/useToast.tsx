import { useState, useCallback, useEffect, useRef } from 'react';

export function useToast(timeout = 4000) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | null;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setToast(null);
      }, timeout);
    },
    [timeout],
  );

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showToast, closeToast };
}
