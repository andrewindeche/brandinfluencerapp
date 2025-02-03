import React, { useState } from 'react';
import Image from 'next/image';

const MAX_CHAR_COUNT = 70;

interface Influencer {
  alt: string;
  likes: number;
  image: string;
  name: string;
  message: string;
}

const InfluencerCard: React.FC<{ influencer: Influencer }> = ({
  influencer,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fullMessage = influencer.message.split('\n').slice(2).join(' ');
  const displayedMessage = expanded
    ? fullMessage
    : `${fullMessage.slice(0, MAX_CHAR_COUNT)}${fullMessage.length > MAX_CHAR_COUNT ? '...' : ''}`;

  return (
    <div
      className={`relative w-full max-w-xs sm:w-[12rem] h-[24rem] rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105`}
      style={{ borderColor: '#023EBA', backgroundColor: 'black' }}
    >
      <div className="absolute top-2 left-8 transform -translate-x-1/2 rotate-12 bg-black bg-opacity-40 text-white text-center px-2 py-0.5 rounded-2xl font-bold text-sm sm:text-[7px]">
        <span className="inline-block transform -rotate-12 text-white">
          {influencer.likes} likes
        </span>
      </div>
      <Image
        src={influencer.image}
        alt={influencer.alt}
        layout="responsive"
        width={150}
        height={200}
        style={{ objectFit: 'cover' }}
        className="object-cover"
      />
      <div className="absolute bottom-40 left-5 rotate-12 bg-black bg-opacity-60 w-3/4  px-2 py-2 rounded-2xl text-center">
        <p className="text-white text-xs font-bold transform -rotate-12">
          {influencer.name}
        </p>
      </div>
      <div className="absolute bottom-0 w-full bg-black text-white text-[10px] py-2 px-4 rounded-t-lg">
        <div className=" border-t border-b border-white py-1 px-1">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold mb-1">
              {influencer.message.split('\n')[0]}
            </p>
            <p className="text-right text-gray-300 text-xxs">16/01/2025</p>
          </div>
          <p className="text-gray-300 mb-2">
            {influencer.message.split('\n')[1]}
          </p>

          <p>{displayedMessage}</p>
          {fullMessage.length > MAX_CHAR_COUNT && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-yellow-400 hover:underline"
            >
              {expanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerCard;
