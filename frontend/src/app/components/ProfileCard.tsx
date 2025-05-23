import React from 'react';
import Image from 'next/image';

const ProfileCard: React.FC = () => {
  return (
    <div className="bg-black text-white rounded-2xl overflow-hidden shadow-lg w-full max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
      <div className="relative w-full h-60">
        <Image
          src="/images/screenshots/HandM.jpg"
          alt="H&M Logo"
          layout="fill"
          objectFit="cover"
          className="w-full h-auto rounded-b-2xl"
        />
      </div>
      <div className="text-center p-4">
        <div className="relative w-full my-2">
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 opacity-100 bg-transparent"></div>
        </div>
        <h3 className="text-sm font-bold mb-0">H & M Brands</h3>
        <h4 className="text-sm underline underline-offset-8 font-medium mb-2">
          About
        </h4>
        <div className="relative max-h-28 overflow-hidden hover:overflow-auto hover:scrollbar-thin hover:scrollbar-thumb-yellow-500 hover:scrollbar-track-gray-800 transition-all duration-300">
          <p className="text-xs leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        <div className="relative w-full my-2">
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 opacity-100 bg-transparent"></div>
        </div>
      </div>
    </div>
  );
};

const StatsCard: React.FC = () => {
  return (
    <div className="border border-white bg-black text-white rounded-xl shadow-lg w-full max-w-xl mx-auto mt-8 p-6 flex justify-around">
      <div className="text-center">
        <p className="text-xl font-bold">30k</p>
        <p className="text-xs text-gray-400">Posts</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">5k</p>
        <p className="text-xs text-gray-400">Likes</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">60.2k</p>
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
