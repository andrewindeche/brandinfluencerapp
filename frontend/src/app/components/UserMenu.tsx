import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface UserMenuProps {
  userName: string;
  imageSrc: string;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  imageSrc,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cursor-pointer flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-1 border-black flex items-center justify-center">
          <div className="w-12 rounded-md border-1 border-black h-14">
            <Image
              src={imageSrc}
              alt={userName || 'User'}
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-black/80 text-white rounded-lg shadow-lg z-10">
          <p className="px-4 py-2 text-center text-sm font-bold">
            {userName || 'User'}
          </p>
          <hr className="border-gray-600" />
          <button
            onClick={onLogout}
            className="block px-10 py-2 text-center text-sm hover:bg-gray-700 hover:text-yellow-400"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
