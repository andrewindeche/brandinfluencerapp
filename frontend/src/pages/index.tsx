import React from 'react';
import Image from 'next/image';

const HomePage: React.FC = () => {
  return (
    <div className="bg-[#FF2C2C] bg-transition min-h-screen flex flex-col justify-start items-center p-4">
      <div className="flex flex-col md:flex-row justify-center items-center w-full mt-4 space-y-4 md:space-y-0 md:space-x-4 text-center">
        <h1 className="text-white text-5xl font-bold custom-underline">
          AFFLUENCER
        </h1>
        <h2 className="text-white text-2xl custom-underline2">
          Influencer MarketPlace
        </h2>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline flicker-text">
          Our Influencers
        </h3>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-12 sm:space-y-2 sm:space-x-16 w-full px-4">
        <div
          className="relative w-full max-w-xs sm:w-[18rem]  h-96 sm:h-[21rem] rounded-xl overflow-hidden shadow-lg border-4 transform rotate-6 transition-transform hover:scale-105 md:-ml-8"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman2.png"
            alt="Amy - TikTok"
            layout="fill"
            style={{ objectFit: 'cover' }}
            className="object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -rotate-6 -translate-x-1/2 bg-black bg-opacity-30 text-white text-center px-2 py-1 rounded-lg font-bold text-base sm:text-sm">
            AMY - TIK TOK
          </p>
        </div>

        <div
          className="relative w-full max-w-xs sm:w-[20rem]  h-96 sm:h-[16rem] rounded-xl overflow-hidden shadow-lg border-4 transform -rotate-12 transition-transform hover:scale-105"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/man.png"
            alt="Brad - YouTuber"
            layout="fill"
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 900px) 100vw, 50vw"
            priority
            className="object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 text-white text-center px-2 py-1 rounded-lg font-bold text-base sm:text-sm">
            BRAD - YOU TUBER
          </p>
        </div>

        <div
          className="relative w-full max-w-xs sm:w-[20rem] h-96 sm:h-[20rem] rounded-xl overflow-hidden shadow-lg border-4 transform rotate-2 transition-transform hover:scale-105"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman3.png"
            alt="Lizzie - Instagram"
            layout="fill"
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 100px) 100vw, 50vw"
            className="object-cover"
          />
          <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 text-white text-center px-2 py-1 rounded-lg font-bold text-base sm:text-sm">
            LIZZIE - INSTAGRAM
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
