import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { authStore } from '@/rxjs/authStore';
import Loader from './Loader';
import PageSpinner from './PageSpinner';

interface UserMenuProps {
  userName?: string;
  imageSrc?: string;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  imageSrc,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPageSpinner, setShowPageSpinner] = useState(false);
  const [user, setUser] = useState(authStore.getCurrentUser());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sub = authStore.state$.subscribe(() => {
      setUser(authStore.getCurrentUser());
    });
    return () => sub.unsubscribe();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setConfirmLogout(false);
    }, 150);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    setTimeout(() => {
      setShowPageSpinner(true);
    }, 1500);

    setTimeout(() => {
      onLogout?.();
      router.push('/login');
    }, 3000);
  };

  if (showPageSpinner) {
    return <PageSpinner />;
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cursor-pointer flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-black bg-black/40 flex items-center justify-center">
          <div className="w-12 h-14 rounded-md border border-black">
            <Image
              src={imageSrc || '/images/image4.png'}
              alt={userName || 'User'}
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-black/90 text-white rounded-lg shadow-lg z-10 p-2 text-sm space-y-1">
          <p className="text-center font-bold">{user.username || 'User'}</p>
          <hr className="border-gray-600" />

          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full px-4 py-1 hover:bg-gray-700 hover:text-yellow-400"
            >
              Logout
            </button>
          ) : isLoggingOut ? (
            <Loader />
          ) : (
            <div className="space-y-2 text-center">
              <p>Are you sure?</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleLogoutConfirm}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
