import React, { useState } from 'react';
import Image from 'next/image';
import { Influencer } from '../../interfaces';
import { ChevronDown, ChevronUp } from 'lucide-react';

const InfluencerCard: React.FC<{ influencer: Influencer }> = ({
  influencer,
}) => {
  const [expandedBio, setExpandedBio] = useState(false);

  return (
    <div
      className={`relative w-full max-w-xs sm:w-[14rem] rounded-xl overflow-hidden shadow-lg bg-white border-2`}
      style={{ borderColor: '#023EBA' }}
    >
      <div className="relative h-48">
        <Image
          src={influencer.image}
          alt={influencer.alt || 'Influencer'}
          fill
          style={{ objectFit: 'cover' }}
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {influencer.likes}% Match
        </div>
      </div>

      <div className="absolute top-2 right-2 transform -translate-y-1/2 translate-x-2 bg-black bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-lg">
        {influencer.name}
      </div>

      <div className="p-3 mt-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold text-gray-600 mb-1">Bio</p>
          <button
            onClick={() => setExpandedBio(!expandedBio)}
            className="text-blue-500 hover:text-blue-700"
          >
            {expandedBio ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
        {expandedBio ? (
          <p className="text-xs text-gray-600 mt-1">
            {influencer.message.split('\n').slice(2).join(' ') || 'No bio available'}
          </p>
        ) : (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {influencer.message.split('\n').slice(2).join(' ') || 'No bio available'}
          </p>
        )}
      </div>
    </div>
  );
};

export default InfluencerCard;
