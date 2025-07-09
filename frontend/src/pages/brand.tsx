import React, { useEffect, useState } from 'react';
import InfluencerCard from '../app/components/InfluencerCard';
import CampaignsContent from '../app/components/CampaignsContent';
import { Influencer } from '../types';
import UserMenu from '../app/components/UserMenu';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useRouter } from 'next/router';
import { authState$ } from '@/rxjs/authStore';

const BrandPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'influencers' | 'campaigns'>(
    'campaigns',
  );
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null,
  );
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string>(
    '/images/screenshots/HandM.jpg',
  );
  const router = useRouter();
  const { authorized, checked } = useRoleGuard(['brand']);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  useEffect(() => {
    const sub = authState$.subscribe((state) => {
      setUsername(state.username || localStorage.getItem('username') || 'User');
      setProfileImage(
        state.profileImage ||
          localStorage.getItem('profileImage') ||
          '/images/screenshots/HandM.jpg',
      );
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const toastMessage = sessionStorage.getItem('toastMessage');
    let timeout: NodeJS.Timeout;
    if (toastMessage) {
      sessionStorage.removeItem('toastMessage');
      setToast({ message: toastMessage, type: 'success' });
      timeout = setTimeout(() => setToast(null), 3000);
    }
    return () => clearTimeout(timeout);
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) return null;

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
    <div className="bg-[#005B96] min-h-screen flex flex-col items-center px-2 sm:px-4 lg:px-4">
      <div className="absolute top-2 right-6 sm:right-16 z-50">
        <UserMenu
          userName={username}
          imageSrc={profileImage}
          onLogout={handleLogout}
        />
      </div>

      {toast && (
        <div
          className={`fixed top-20 right-4 sm:right-10 z-50 text-white px-4 py-3 rounded shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 w-full">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`transition-transform duration-300 py-2 px-24 rounded-full border-2 hover:scale-105 ${
            activeTab === 'campaigns'
              ? '!bg-red-600 !text-white !border-white'
              : '!bg-yellow-300 !text-black !border-black'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('influencers')}
          className={`transition-transform duration-300 py-2 px-24 rounded-full border-2 hover:scale-105 ${
            activeTab === 'influencers'
              ? '!bg-red-600 !text-white !border-white'
              : '!bg-yellow-300 !text-black !border-black'
          }`}
        >
          Influencers
        </button>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-2xl font-bold underline underline-offset-4 mb-1">
          {activeTab === 'campaigns' ? '📈 Campaigns' : '📢 Influencer Matches'}
        </h3>
      </div>

      <div className="mt-4 w-full max-w-screen-xl mx-auto flex flex-col gap-4">
        {activeTab === 'campaigns' ? (
          <CampaignsContent />
        ) : (
          <div className="flex flex-wrap justify-center gap-20">
            {influencers.map((influencer) => (
              <InfluencerCard
                key={influencer.name}
                influencer={{
                  ...influencer,
                  message: influencer.message,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
