import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const useRoleGuard = (allowedRoles: string[]) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userType = localStorage.getItem('userType');

    if (!userType) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(userType)) {
      router.replace('/unauthorized');
    } else {
      setLoading(false);
    }
  }, [allowedRoles, router]);

  if (loading) return null;

  return null;
};
