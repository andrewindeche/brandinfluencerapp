import React from 'react';
import Image from 'next/image';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#FF2C2C] h-screen flex flex-col justify-start items-center">
      <div className="flex flex-row justify-center items-center w-full mt-4 space-x-4">
        <h1 className="text-white text-5xl font-bold custom-underline">
          AFFLUENCER
        </h1>
        <h2 className="text-white text-2xl custom-underline2">
          Influencer MarketPlace
        </h2>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline">Our Influencers</h3>
      </div>
      <div className="mt-10 flex flex-row justify-center items-center space-x-12">
        <div
          className="relative w-60 h-80 rounded-xl overflow-hidden shadow-lg border-4 transform rotate-6 transition-transform hover-effect"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman2.png"
            alt="Amy - TikTok"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -rotate-6 -translate-x-1/2 bg-black bg-opacity-50 text-white text-center px-2 py-1 rounded-lg font-bold">
            AMY - TIK TOK
          </p>
        </div>
        <div
          className="relative w-70 h-80 rounded-xl overflow-hidden shadow-lg border-4 rotate-12 transition-transform hover-effect"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/man.png"
            alt="Amy - TikTok"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-center px-2 py-1 rounded-lg font-bold">
            BRAD - YOU TUBER
          </p>
        </div>
        <div
          className="relative w-60 h-80 rounded-xl overflow-hidden shadow-lg border-4 transform rotate-2 transition-transform hover-effect"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman3.png"
            alt="Lizzie - Instagram"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-center px-2 py-1 rounded-lg font-bold">
            LIZZIE - INSTAGRAM
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
