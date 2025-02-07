import React from 'react';
import Image from 'next/image';

const ProfileCard: React.FC = () => {
  return (
    <div className="bg-black text-white rounded-lg overflow-hidden shadow-lg w-full max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
      <div className="relative w-full h-40">
        <Image
          src="/images/screenshots/HandM.jpg"
          alt="H&M Logo"
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>

      <div className="text-center p-4">
        <h3 className="text-lg font-bold mb-2">H & M Brands</h3>
        <h4 className="text-sm font-medium mb-2">About</h4>
        <p className="text-xs leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>
  );
};

const StatsCard: React.FC = () => {
  return (
    <div className="border border-white bg-black text-white rounded-lg shadow-lg w-full max-w-xl mx-auto mt-2 p-3 flex justify-around">
      <div className="text-center">
        <p className="text-sm font-bold">30k</p>
        <p className="text-xs text-gray-400">Posts</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold">5k</p>
        <p className="text-xs text-gray-400">Likes</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold">60.2k</p>
        <p className="text-xs text-gray-400">Comments</p>
      </div>
    </div>
  );
};

const ProfileWithStats: React.FC = () => {
  return (
    <>
      <ProfileCard />
      <StatsCard />
    </>
  );
};

export default ProfileWithStats;
