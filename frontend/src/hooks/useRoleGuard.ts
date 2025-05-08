import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useRoleGuard = (allowedRoles: string[]) => {
  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem('userType');

    if (!userType || !allowedRoles.includes(userType)) {
      router.replace('/unauthorized');
    }
  }, [allowedRoles, router]);
};
