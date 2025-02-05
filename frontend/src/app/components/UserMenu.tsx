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
      <div className="cursor-pointer">
        <Image
          src="/images/screenshots/HandM.jpg"
          alt="H and M"
          width={50}
          height={50}
          className="rounded-full"
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
          <p className="px-4 py-2 text-sm text-gray-700">H and M</p>
          <hr />
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
