import React, { useState } from 'react';
import Image from 'next/image';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="cursor-pointer flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
          <div className="w-12 h-12">
            <Image
              src="/images/screenshots/HandM.jpg"
              alt="H and M"
              width={48}
              height={48}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-black text-white rounded-lg shadow-lg z-10">
          <p className="px-4 py-2 text-center text-sm font-bold">H and M</p>
          <hr className="border-gray-600" />
          <a
            href="#"
            className="block px-4 py-2 text-center text-sm hover:bg-gray-700 hover:text-yellow-400"
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
