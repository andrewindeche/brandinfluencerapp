import React, { useState } from 'react';
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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="cursor-pointer flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
          <div className="w-20 border-2 border-black h-12">
            <Image
              src={imageSrc || '/images/screenshots/HandM.jpg'}
              alt={userName || 'User'}
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-black text-white rounded-lg shadow-lg z-10">
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
