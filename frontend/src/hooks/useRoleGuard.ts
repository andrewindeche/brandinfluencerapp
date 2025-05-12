import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const useRoleGuard = (allowedRoles: string[]) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem('userType');

    if (!userType) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(userType)) {
      router.replace('/unauthorized');
    } else {
      setAuthorized(true);
    }

    setChecked(true);
  }, [allowedRoles, router]);

  return { authorized, checked };
};
