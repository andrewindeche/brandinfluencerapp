import React, { useEffect, useState, useMemo } from 'react';
import InfluencerCard from '../app/components/InfluencerCard';
import CampaignsContent from '../app/components/CampaignsContent';
import type { Influencer } from '../interfaces';
import UserMenu from '../app/components/UserMenu';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useRouter } from 'next/router';
import { authState$ } from '@/rxjs/authStore';
import axiosInstance from '../rxjs/axiosInstance';

interface MatchedInfluencer extends Influencer {
  id: string;
  category: string;
  interests?: string[];
  matchPercentage: number;
}

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
  const [matchedInfluencers, setMatchedInfluencers] = useState<MatchedInfluencer[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const router = useRouter();
  const { authorized, checked } = useRoleGuard(['brand']);

  const MAX_PER_PAGE = 3;
  const [influencerPage, setInfluencerPage] = useState(1);

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

  useEffect(() => {
    if (activeTab === 'influencers' && authorized) {
      setInfluencersLoading(true);
      axiosInstance.get('/users/influencers/matched')
        .then((res) => {
          setMatchedInfluencers(res.data || []);
        })
        .catch(() => {
          setMatchedInfluencers([]);
        })
        .finally(() => {
          setInfluencersLoading(false);
        });
    }
  }, [activeTab, authorized]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) return null;

  const MAX_PER_PAGE = 3;
  const [influencerPage, setInfluencerPage] = useState(1);

  const sortedInfluencers = useMemo(() => {
    return [...matchedInfluencers].sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [matchedInfluencers]);

  const influencerCount = sortedInfluencers.length;
  const influencerMaxPage = Math.ceil(influencerCount / MAX_PER_PAGE);
  const paginatedInfluencers = sortedInfluencers.slice(
    (influencerPage - 1) * MAX_PER_PAGE,
    influencerPage * MAX_PER_PAGE,
  );

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

      <div className="mt-4 text-center">
        <h3 className="text-2xl font-bold underline underline-offset-4 mb-1">
          {activeTab === 'campaigns' ? '📈 Campaigns' : '📢 Influencer Matches'}
        </h3>
      </div>

      <div className="mt-2 w-full max-w-screen-xl mx-auto flex flex-col gap-4">
        {activeTab === 'campaigns' ? (
          <CampaignsContent />
        ) : influencersLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Finding the best matches for you...</p>
            </div>
          </div>
        ) : paginatedInfluencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <p className="text-xl font-medium">No matched influencers found</p>
            <p className="text-sm mt-2 opacity-80">Add interests to your profile to get better matches</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-20">
              {paginatedInfluencers.map((influencer) => (
                <InfluencerCard
                  key={influencer.id}
                  influencer={{
                    name: influencer.username || 'Unknown',
                    likes: influencer.matchPercentage,
                    message: `Match: ${influencer.matchPercentage}% - ${influencer.category || 'Influencer'}`,
                    image: influencer.profileImage || '/images/image4.png',
                    alt: `${influencer.username} - ${influencer.category || 'Influencer'}`,
                    interests: influencer.interests,
                    matchPercentage: influencer.matchPercentage,
                  }}
                />
              ))}
            </div>
            {influencerMaxPage > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => setInfluencerPage((p) => Math.max(1, p - 1))}
                  disabled={influencerPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2">
                  Page {influencerPage} of {influencerMaxPage}
                </span>
                <button
                  onClick={() =>
                    setInfluencerPage((p) => Math.min(influencerMaxPage, p + 1))
                  }
                  disabled={influencerPage === influencerMaxPage}
                  className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
