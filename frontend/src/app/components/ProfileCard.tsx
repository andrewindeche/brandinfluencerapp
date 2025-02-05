import React from 'react';
import Image from 'next/image';

const ProfileCard: React.FC = () => {
  return (
    <>
      <div className="bg-black text-white p-8 rounded-lg mb-10">
        <Image
          src="/images/screenshots/HandM.jpg"
          alt="H&M Logo"
          width={50}
          height={70}
          className="mb-4"
        />
        <div className="border-t border-white-700 pt-4">
          <h3 className="text-xs font-bold mb-2">H & M Brands</h3>
          <h4 className="text-xs mb-4">About</h4>
          <p className="text-xs mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
            vel urna eros.
          </p>
        </div>
      </div>
      <div className="flex shadow-lg border border-white bg-black text-white p-2 rounded-lg mb-2 justify-center items-center">
        <div className="p-2 mx-1">
          <p className="text-l font-bold text-white">30k</p>
          <p className="text-xs text-gray-400">Posts</p>
        </div>
        <div className="p-2 mx-1">
          <p className="text-l font-bold text-white">5k</p>
          <p className="text-xs text-gray-400">Likes</p>
        </div>
        <div className="p-2 mx-1">
          <p className="text-l font-bold text-white">60.2k</p>
          <p className="text-xs text-gray-400">Comments</p>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
