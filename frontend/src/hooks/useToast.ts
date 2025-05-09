import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
};
