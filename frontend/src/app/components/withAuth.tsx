import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface WithAuthProps {
  role: 'brand' | 'influencer' | 'admin' | 'superuser';
}

const withAuth = (WrappedComponent: React.FC, allowedRoles: string[]) => {
  const AuthComponent: React.FC<WithAuthProps> = ({ role, ...props }) => {
    const router = useRouter();

    useEffect(() => {
      if (!allowedRoles.includes(role)) {
        router.replace('/unauthorized');
      }
    }, [role, router]);

    return allowedRoles.includes(role) ? <WrappedComponent {...props} /> : null;
  };

  return AuthComponent;
};

export default withAuth;
