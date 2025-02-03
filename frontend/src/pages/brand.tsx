import React, { useState } from 'react';
import InfluencerList from '../app/components/InfluencerList';
import CampaignsContent from '../app/components/CampaignsContent';

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
        <h3 className="text-2xl text-[#FFFF00] underline">Submissions</h3>
      </div>

      {/* Conditional rendering based on the activeTab */}
      {activeTab === 'influencers' ? (
        <InfluencerList influencers={influencers} />
      ) : (
        <CampaignsContent />
      )}
    </div>
  );
};

export default BrandPage;
