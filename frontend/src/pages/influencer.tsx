import React, { useState, useEffect, useMemo } from 'react';
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
import { notificationStore } from '../rxjs/notificationStore';
import { NotificationType } from '@/interfaces';
import { submissions$ } from '../rxjs/submissionStore';
import axiosInstance from '../rxjs/axiosInstance';
import NotificationWidget from '../app/components/NotificationWidget';
import BrandInvitationModal from '../app/components/BrandInvitationModal';

const InfluencerPage: React.FC = () => {
  const { authorized, checked } = useRoleGuard(['influencer']);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] =
    useState<string>('/images/image4.png');
  const [bio, setBio] = useState<string>('');
  const [username, setUsername] = useState('');
  const { toast, showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<string>('💡 Click \'Submit\' to send your entry or tap on a campaign card to expand.');
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [matchedBrands, setMatchedBrands] = useState<{ id: string; matchPercentage: number }[]>([]);

  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<NotificationType | null>(null);
  const [invitationProcessing, setInvitationProcessing] = useState(false);
  const [acceptedBrands, setAcceptedBrands] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('acceptedBrands');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('acceptedBrands', JSON.stringify([...acceptedBrands]));
  }, [acceptedBrands]);

  const [submissionsValue, setSubmissionsValue] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const sub = submissions$.subscribe(setSubmissionsValue);
    return () => sub.unsubscribe();
  }, []);

  const stats = useMemo(() => {
    let totalSubmissions = 0;
    let acceptedSubmissions = 0;
    let rejectedSubmissions = 0;

    Object.values(submissionsValue).forEach((subs) => {
      if (Array.isArray(subs)) {
        const userSubs = subs.filter(
          (s) => String(s.influencer?._id || s.influencer) === userId
        );
        totalSubmissions += userSubs.length;
        acceptedSubmissions += userSubs.filter((s) => s.status === 'accepted').length;
        rejectedSubmissions += userSubs.filter((s) => s.status === 'rejected').length;
      }
    });

    return {
      submissions: totalSubmissions,
      accepted: acceptedSubmissions,
      rejected: rejectedSubmissions,
      posts: totalSubmissions,
      likes: acceptedSubmissions * 10,
      shares: Math.floor(acceptedSubmissions * 2.5),
    };
  }, [campaigns, userId, submissionsValue]);

  useEffect(() => {
    setCampaignsLoading(true);
    campaignStore.fetchCampaigns().then(() => {
      setCampaignsLoading(false);
      const sub = campaignStore.campaigns$.subscribe(setCampaigns);
      return () => sub.unsubscribe();
    });

    const allSubmissions = submissions$.getValue();
    Object.keys(allSubmissions).forEach((campaignId) => {
      import('../rxjs/submissionStore').then((module) => {
        module.submissionStore.fetchSubmissions(campaignId);
      });
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
      setUserId(state.id || localStorage.getItem('userId') || '');
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
    if (!userId) return;
    axiosInstance.get('/users/tips')
      .then((res) => {
        if (res.data && res.data.tips) {
          setTips(res.data.tips);
        }
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    axiosInstance.get('/users/brands/matched')
      .then((res) => {
        setMatchedBrands(res.data || []);
      })
      .catch(() => {});

    axiosInstance.get('/users/brands/accepted')
      .then((res) => {
        const acceptedFromDb = (res.data || []).map((b: any) => b.id);
        setAcceptedBrands(prev => {
          const merged = new Set([...prev, ...acceptedFromDb]);
          return merged;
        });
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    const sub =
      notificationStore.influencerNotifications$.subscribe((notifs) => {
        setNotifications(notifs);
        const latestAccepted = notifs.find((n) => n.type === 'influencer_accepted');
        if (latestAccepted && !invitationModalOpen) {
          setPendingInvitation(latestAccepted);
          setInvitationModalOpen(true);
        }
      });
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

  const handleAcceptInvitation = async () => {
    if (!pendingInvitation) return;
    setInvitationProcessing(true);
    try {
      await axiosInstance.post(`/users/brand/${pendingInvitation.brandId}/accept`);
      if (pendingInvitation.brandId) {
        setAcceptedBrands(prev => new Set([...prev, pendingInvitation.brandId!]));
      }
      showToast(`You've joined ${pendingInvitation.brandName || 'the brand'}! You can now make submissions.`, 'success');
      setInvitationModalOpen(false);
      setPendingInvitation(null);
    } catch (error) {
      showToast('Failed to accept invitation', 'error');
    } finally {
      setInvitationProcessing(false);
    }
  };

  const handleRejectInvitation = () => {
    setInvitationModalOpen(false);
    setPendingInvitation(null);
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

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E8BB5B]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading campaigns...</p>
        </div>
      </div>
    );
  }

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
              likes={stats.likes}
              shares={stats.shares}
              campaigns={campaigns.length}
              posts={stats.posts}
              submissions={stats.submissions}
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
            tips={tips}
            matchedBrands={matchedBrands}
            userBio={bio}
            acceptedBrands={acceptedBrands}
          />

          <NotificationWidget notifications={notifications} showToast={showToast} />

          <BrandInvitationModal
            notification={pendingInvitation}
            onAccept={handleAcceptInvitation}
            onReject={handleRejectInvitation}
            isProcessing={invitationProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default InfluencerPage;
