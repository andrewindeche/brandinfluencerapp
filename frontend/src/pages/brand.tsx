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
  const [profileImage, setProfileImage] = useState(
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
      message: 'Influencer Network\nJoin our Influencer Network Today! ...',
      image: '/images/image3.png',
      alt: 'April - TikTok',
    },
    {
      name: 'JESY',
      likes: 50,
      message: 'Social Media\nJoin our TikTok account ...',
      image: '/images/image2.png',
      alt: 'Jesy - YouTuber',
    },
    {
      name: 'KATE',
      likes: 20,
      message: 'Social Media\nJoin our TikTok account ...',
      image: '/images/image2.png',
      alt: 'Kate - Instagram',
    },
    {
      name: 'BRAD',
      likes: 20,
      message: 'Social Media\nJoin our TikTok account ...',
      image: '/images/image4.png',
      alt: 'Brad - Instagram',
    },
  ];

  return (
    <div className="bg-[#005B96] min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 py-4">
      {/* User menu */}
      <div className="absolute top-2 right-4 sm:right-16 z-50">
        <UserMenu
          userName={username}
          imageSrc={profileImage}
          onLogout={handleLogout}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 sm:right-10 z-50 text-white px-4 py-3 rounded shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Tab buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 w-full max-w-md">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`transition-all duration-300 py-2 px-6 sm:px-12 lg:px-20 w-full sm:w-auto text-center rounded-full border-2 hover:scale-105 ${
            activeTab === 'campaigns'
              ? '!bg-red-600 !text-white !border-white'
              : '!bg-yellow-300 !text-black !border-black'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('influencers')}
          className={`transition-all duration-300 py-2 px-6 sm:px-12 lg:px-20 w-full sm:w-auto text-center rounded-full border-2 hover:scale-105 ${
            activeTab === 'influencers'
              ? '!bg-red-600 !text-white !border-white'
              : '!bg-yellow-300 !text-black !border-black'
          }`}
        >
          Influencers
        </button>
      </div>

      {/* Section header */}
      <div className="mt-6 text-center">
        <h3 className="text-2xl font-bold underline underline-offset-4 mb-1">
          {activeTab === 'campaigns' ? '📈 Campaigns' : '📢 Influencer Matches'}
        </h3>
      </div>

      {/* Content */}
      <div className="mt-4 w-full max-w-screen-xl mx-auto flex flex-col gap-4">
        {activeTab === 'campaigns' ? (
          <CampaignsContent />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
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
