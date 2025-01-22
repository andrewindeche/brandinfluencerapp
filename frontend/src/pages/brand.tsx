import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const BrandPage: React.FC = () => {
  return (
    <div className="bg-[#005B96] min-h-screen flex flex-col justify-start items-center">
      <div className="flex justify-center space-x-4 mt-2">
        <button className="bg-yellow-500 text-black py-2 px-14 rounded-full border-2 border-black">
          Influencers
        </button>
        <button className="bg-red-500 text-white py-2 px-14 rounded-full border-2 border-white relative">
          campaigns
        </button>
      </div>
    </div>
  );
};

export default BrandPage;
