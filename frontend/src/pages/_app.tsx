import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Irish_Grover, Joti_One, Kaushan_Script } from 'next/font/google';
import Toast from '../app/components/Toast';
import ConnectionStatusIndicator from '../app/components/ConnectionStatusIndicator';
import { useState, useCallback, useEffect } from 'react';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { InactivityModal } from '@/app/components/InactivityModal';
import { setAuthToken } from '../rxjs/axiosInstance';
import { socketHandler } from '../../socketHandler';
import { toastEvents$, ToastEvent } from '../rxjs/toastEvents';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const irishGrover = Irish_Grover({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-irish-grover',
});

const jotiOne = Joti_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-joti-one',
});

const kaushanScript = Kaushan_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kaushan-script',
});

function MyApp({ Component, pageProps }: AppProps) {
  const { showWarning } = useInactivityLogout();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      socketHandler.connect();
    }
  }, []);

  useEffect(() => {
    const sub = toastEvents$.subscribe((event) => {
      if (event) {
        setToast({ message: event.message, type: event.type });
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 8000);
    },
    [],
  );

  return (
    <main
      className={`${irishGrover.variable} ${jotiOne.variable} ${kaushanScript.variable}`}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ConnectionStatusIndicator />
      <InactivityModal visible={showWarning} />
      <Component {...pageProps} showToast={showToast} />
    </main>
  );
}

export default MyApp;
