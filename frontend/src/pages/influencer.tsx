import React, { useState, useEffect } from 'react';
import UserMenu from '../app/components/UserMenu';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useToast } from '../hooks/useToast';
import router from 'next/router';
import { profileUpdateStore } from '../rxjs/profileUpdateStore';
import { authState$ } from '../rxjs/authStore';
import NotificationsSection from '../app/components/NotificationsSection';
import CampaignsSection from '../app/components/CampaignsSection';
import { campaignStore } from '../rxjs/campaignStore';
import { CampaignType } from '@/types';
import ProfileWithStats from '../app/components/ProfileCard';
import { getRandom } from '../app/utils/random';
import { notificationStore } from '../rxjs/notificationStore';
import { NotificationType } from '@/interfaces';

const InfluencerPage: React.FC = () => {
  const { authorized, checked } = useRoleGuard(['influencer']);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] =
    useState<string>('/images/image4.png');
  const [bio, setBio] = useState<string>('');
  const [username, setUsername] = useState('');
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [likes] = useState(getRandom(50, 200));
  const [shares] = useState(getRandom(10, 100));
  const [posts] = useState(getRandom(5, 15));
  const [submissions] = useState(getRandom(2, 10));

  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    campaignStore.fetchCampaigns().then(() => {
      const sub = campaignStore.campaigns$.subscribe(setCampaigns);
      return () => sub.unsubscribe();
    });
  }, []);

  useEffect(() => {
    const sub = authState$.subscribe((state) => {
      setUsername(state.username || localStorage.getItem('username') || 'User');
      setProfileImage(
        state.profileImage ||
          localStorage.getItem('profileImage') ||
          '/images/image4.png',
      );
      setBio(state.bio || localStorage.getItem('bio') || '');
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const toastMessage = sessionStorage.getItem('toastMessage');
    if (toastMessage) {
      showToast(toastMessage, 'success');
      setTimeout(() => {
        sessionStorage.removeItem('toastMessage');
      }, 100);
    }
  }, [showToast]);

  useEffect(() => {
    const sub =
      notificationStore.influencerNotifications$.subscribe(setNotifications);
    return () => sub.unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleToggleExpand = (title: string): void => {
    setExpandedCards((prevState) => ({
      ...prevState,
      [title]: !prevState[title],
    }));
  };

  const handleCampaignAction = (campaign: string) => {
    showToast(`${campaign} was successfully updated!`, 'success');
  };

  const handleProfileSave = async (
    newBio: string,
    newImage: File | string | null,
  ) => {
    setLoading(true);
    try {
      const imagePath = await profileUpdateStore.updateProfile(
        newBio,
        newImage!,
        showToast,
      );
      setBio(newBio);
      if (typeof newImage === 'string') {
        setProfileImage(`${newImage}?t=${Date.now()}`);
      } else {
        setProfileImage(`${imagePath}?t=${Date.now()}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="bg-[#E8BB5B] px-4 sm:px-6 lg:px-12 py-6 min-h-screen relative max-w-screen-xl mx-auto">
      <div className="absolute top-2 right-4 md:right-28 z-50">
        <UserMenu
          userName={username}
          imageSrc={profileImage}
          onLogout={handleLogout}
        />
      </div>

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 text-white px-4 py-3 rounded shadow-lg transition-all duration-300 ease-in-out ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-semibold text-[#1E1E1E] text-center mt-4">
        My Profile
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        <div className="w-full lg:w-[25%] min-w-[250px] max-w-full space-y-12">
          {profileImage && (
            <ProfileWithStats
              username={username}
              profileImage={profileImage}
              bio={bio}
              likes={likes}
              shares={shares}
              campaigns={campaigns.length}
              posts={posts}
              submissions={submissions}
              onSave={handleProfileSave}
              loading={loading}
              showToast={showToast}
            />
          )}
        </div>

        <div className="w-full lg:w-4/5 space-y-6">
          <NotificationsSection
            notifications={notifications}
            show={showNotifications}
            toggleShow={() => setShowNotifications(!showNotifications)}
            message="Notifications"
          />

          <CampaignsSection
            campaigns={campaigns}
            expanded={expandedCards}
            onExpandToggle={handleToggleExpand}
            onCampaignAction={handleCampaignAction}
            notificationOpen={showNotifications}
            joined={false}
          />
        </div>
      </div>
    </div>
  );
};

export default InfluencerPage;
