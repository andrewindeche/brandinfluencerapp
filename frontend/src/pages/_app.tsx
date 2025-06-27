import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Irish_Grover, Joti_One, Kaushan_Script } from 'next/font/google';
import Toast from '../app/components/Toast';
import { useState, useCallback } from 'react';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { InactivityModal } from '@/app/components/InactivityModal';
import { useEffect } from 'react';
import { setAuthToken } from '../rxjs/axiosInstance';
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
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error') => {
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
      <InactivityModal visible={showWarning} />
      <Component {...pageProps} showToast={showToast} />
    </main>
  );
}

export default MyApp;
