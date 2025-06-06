import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function useRouteLoading(delay = 500) {
  const router = useRouter();
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleStart = () => {
      timer = setTimeout(() => setIsRouteLoading(true), delay);
    };

    const handleComplete = () => {
      clearTimeout(timer);
      setIsRouteLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router, delay]);

  return isRouteLoading;
}
