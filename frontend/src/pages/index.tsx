import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#FF2C2C] h-screen flex flex-col justify-start items-center">
      <div className="flex flex-row justify-center items-center w-full mt-10 space-x-4">
        <h1 className="text-white text-5xl font-bold">AFFLUENCER</h1>
        <h2 className="text-white text-2xl">Influencer MarketPlace</h2>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl style={{ color: '#FFFF00' }} underline">
          Our Influencers
        </h3>
      </div>
    </div>
  );
};

export default HomePage;
