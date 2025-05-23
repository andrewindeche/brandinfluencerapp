import { useState, useCallback, useEffect } from 'react';

export const useToast = (autoCloseDelay = 3000) => {
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        setToast(null);
      }, autoCloseDelay);

      return () => clearTimeout(timeout);
    }
  }, [toast, autoCloseDelay]);

  return { toast, showToast, closeToast };
};
