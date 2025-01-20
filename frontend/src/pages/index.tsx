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
      <div className="mt-6 flex flex-row justify-center items-center space-x-12">
        <div className="bg-[#023EBA] p-1 rounded-xl shadow-lg">
          <Image
            src="/images/woman2.png"
            alt="Amy - TikTok"
            className="rounded-lg"
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
          />
          <p className="text-black text-center mt-2 font-bold">AMY - TIK TOK</p>
        </div>
        <div className="bg-[#023EBA] p-1 rounded-xl shadow-lg">
          <Image
            src="/images/man.png"
            alt="Brad - YouTube"
            className="rounded-lg"
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
          />
          <p className="text-black text-center mt-2 font-bold">
            BRAD - YOU TUBER
          </p>
        </div>
        <div className="bg-[#023EBA] p-1 rounded-xl shadow-lg">
          <Image
            src="/images/woman3.png"
            alt="Lizzie - Instagram"
            className="rounded-lg"
            width={200}
            height={200}
            style={{ width: '100%', height: 'auto' }}
          />
          <p className="text-black text-center mt-2 font-bold">
            LIZZIE - INSTAGRAM
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
