import React, { useState } from 'react';
import InfluencerCard from '../app/components/InfluencerCard';
import CampaignsContent from '../app/components/CampaignsContent';
import { Influencer } from '../types';

const BrandPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'influencers' | 'campaigns'>(
    'influencers',
  );
  const influencers: Influencer[] = [
    {
      name: 'APRIL',
      likes: 100,
      message:
        "Influencer Network\nJoin our Influencer Network Today!\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image3.png',
      alt: 'April - TikTok',
    },
    {
      name: 'JESY',
      likes: 50,
      message:
        "Social Media\nJoin our tiktok account\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image2.png',
      alt: 'Jesy - YouTuber',
    },
    {
      name: 'KATE',
      likes: 20,
      message:
        "Social Media\nJoin our tiktok account\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image2.png',
      alt: 'kate - Instagram',
    },
    {
      name: 'BRAD',
      likes: 20,
      message:
        "Social Media\nJoin our tiktok account\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image4.png',
      alt: 'kate - Instagram',
    },
  ];

  return (
    <div className="bg-[#005B96] min-h-screen flex flex-col justify-start items-center">
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={() => setActiveTab('influencers')}
          className={`bg-[#FFFF00] hover:scale-105 text-black py-2 px-14 rounded-full border-2 border-black ${activeTab === 'influencers' ? 'bg-yellow-300' : ''}`}
        >
          Influencers
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`bg-red-500 hover:scale-105 text-white py-2 px-14 rounded-full border-2 border-white ${activeTab === 'campaigns' ? 'bg-red-700' : ''}`}
        >
          Campaigns
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline">
          {activeTab === 'influencers' ? 'Submissions' : 'Campaign Metrics'}
        </h3>
      </div>

      <div
        className={`mt-4 flex flex-col sm:flex-row justify-center items-center space-y-12 sm:space-y-2 sm:space-x-20 w-full px-4 fade-in ${activeTab === 'influencers' ? 'show' : ''}`}
      >
        {activeTab === 'influencers' ? (
          influencers.map((influencer, index) => (
            <InfluencerCard key={index} influencer={influencer} />
          ))
        ) : (
          <CampaignsContent />
        )}
      </div>
    </div>
  );
};

export default BrandPage;
