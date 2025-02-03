import React from 'react';
import InfluencerCard from './InfluencerCard';

interface Influencer {
  alt: string;
  likes: number;
  image: string;
  name: string;
  message: string;
}

const InfluencerList: React.FC<{ influencers: Influencer[] }> = ({
  influencers,
}) => {
  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-12 sm:space-y-2 sm:space-x-20 w-full px-4">
      {influencers.map((influencer, index) => (
        <InfluencerCard key={index} influencer={influencer} />
      ))}
    </div>
  );
};

export default InfluencerList;
