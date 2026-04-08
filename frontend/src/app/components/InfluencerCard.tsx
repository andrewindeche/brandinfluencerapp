import React, { useState } from 'react';
import Image from 'next/image';
import { Influencer } from '../../interfaces';
import axiosInstance from '../../rxjs/axiosInstance';

interface InfluencerCardProps {
  influencer: Influencer;
  onAccept?: (influencerId: string) => void;
  onReject?: (influencerId: string) => void;
  isLoading?: boolean;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({
  influencer,
  onAccept,
  onReject,
  isLoading: externalLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fullMessage = influencer.message.split('\n').slice(2).join(' ');
  const MAX_CHAR_COUNT = 100;
  const displayedMessage = expanded
    ? fullMessage
    : `${fullMessage.slice(0, MAX_CHAR_COUNT)}${fullMessage.length > MAX_CHAR_COUNT ? '...' : ''}`;

  const loading = externalLoading;

  const handleAccept = () => {
    if (!onAccept || loading) return;
    onAccept(influencer.id || '');
  };

  const handleReject = () => {
    if (!onReject || loading) return;
    onReject(influencer.id || '');
  };

  return (
    <div
      className={`relative w-full max-w-xs sm:w-[12rem] h-[24rem] rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105`}
      style={{ borderColor: '#023EBA', backgroundColor: 'black' }}
    >
      <div className="absolute top-2 left-8 transform -translate-x-1/2 rotate-12 bg-green-500 text-white text-center px-2 py-0.5 rounded-2xl font-bold text-sm sm:text-[7px]">
        <span className="inline-block transform -rotate-12 text-white">
          {influencer.likes}%
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
      <div className="absolute bottom-40 left-5 rotate-12 bg-black bg-opacity-10 w-3/4  px-2 py-2 rounded-2xl text-center">
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
      
      {onAccept && onReject && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
            title="Reject"
          >
            ✕
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
            title="Accept & Invite"
          >
            ✓
          </button>
        </div>
      )}
    </div>
  );
};

export default InfluencerCard;
