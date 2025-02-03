import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const CampaignsPage: React.FC = () => {
  return (
    <div className="bg-[#005B96] min-h-screen flex flex-col justify-start items-center">
      <div className="flex justify-center space-x-4 mt-4">
        <button className="bg-[#FFFF00] hover:scale-105 text-black py-2 px-14 rounded-full border-2 border-black">
          Influencers
        </button>
        <button className="bg-red-500 hover:scale-105 text-white py-2 px-14 rounded-full border-2 border-white relative">
          Campaigns
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline">Campaign Metrics</h3>
      </div>
    </div>
  );
};

export default CampaignsPage;
