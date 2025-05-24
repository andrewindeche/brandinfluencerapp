import React, { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import UserMenu from '../app/components/UserMenu';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useToast } from '../hooks/useToast';
import router from 'next/router';
import { profileUpdateStore } from '../rxjs/profileUpdateStore';
import { authState$ } from '../rxjs/authStore';
import NotificationsSection from '../app/components/NotificationsSection';
import CampaignsSection from '../app/components/CampaignsSection';

const InfluencerPage: React.FC = () => {
  const { authorized, checked } = useRoleGuard(['influencer']);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] =
    useState<string>('/images/image4.png');
  const [bio, setBio] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});
  const [isHovered, setIsHovered] = useState(false);
  const { toast, showToast } = useToast();
  const [username, setUsername] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const message = `I hope this message finds you well! My name is [Your Name] from [Your Brand], and we would love to have you onboard. We love how your content aligns with our brand! Your engagement metrics are phenomenal, and we believe our partnership will bring great value to both sides.`;
  const campaigns = [
    'Campaign 1',
    'Campaign 2',
    'Campaign 3',
    'Campaign 4',
    'Campaign 5',
    'Campaign 6',
  ];

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

  const handleCampaignAction = (campaign: string) => {
    showToast(`${campaign} was successfully updated!`, 'success');
  };

  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const [likes] = useState(getRandomNumber(21, 200));
  const [shares] = useState(getRandomNumber(21, 150));
  const [showcampaigns] = useState(getRandomNumber(0, 30));
  const [posts] = useState(getRandomNumber(0, 30));
  const [submissions] = useState(getRandomNumber(0, 30));
  type Notification = {
    id: number;
    campaign: string;
    status: 'accepted' | 'rejected';
  };

  const notifications: Notification[] = [
    { id: 1, campaign: 'Sports Campaign', status: 'accepted' },
    { id: 2, campaign: 'Fashion Campaign', status: 'rejected' },
  ];

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

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
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

      <h1 className="text-2xl md:text-3xl font-semibold text-[#FFFF00] text-center mt-4">
        My Profile
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        <div className="w-full lg:w-[25%] min-w-[250px] max-w-full space-y-12">
          <div
            className="p-1 bg-black text-white rounded-2xl relative shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative group rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imagePreview || profileImage}
                alt={username || 'User'}
                width={200}
                height={150}
                className="w-full h-auto rounded-lg"
              />

              <label
                htmlFor="profileImageUpload"
                className="absolute bottom-4 right-4 bg-yellow-400 p-1 rounded cursor-pointer text-black text-sm select-none"
                title="Change profile image"
              >
                Edit Image
              </label>
              <input
                id="profileImageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageChange}
                disabled={loading}
              />

              <div className="absolute transform -translate-x-1/2 rotate-12 px-20 py-3 bottom-6 left-1/2 text-lg bg-black/30 text-white p-2 rounded-full z-10">
                <span className="inline-block transform -rotate-12">
                  {username || 'User'}
                </span>
              </div>
              <div className="absolute top-4 left-1 text-center z-10 space-y-1">
                <div className="bg-black/20 text-white p-3 rounded-full rotate-12">
                  <span className="inline-block transform -rotate-12">
                    {likes} likes
                  </span>
                </div>
                <div className="bg-black/20 rotate-12 text-xs p-3 rounded-full">
                  <span className="inline-block transform -rotate-12">
                    {shares} shares
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-white py-4 px-2 text-center text-xs mt-2">
              <p>Influencer Network</p>
              <p className="text-gray-400">16/01/2025</p>
            </div>

            <div
              className={`h-24 px-2 mt-2 ${isHovered ? 'overflow-y-auto' : 'overflow-hidden'}`}
            >
              {!editingBio && (
                <>
                  <p className="text-center text-sm md:text-base whitespace-pre-wrap">
                    {bio || message}
                  </p>
                  <button
                    onClick={() => {
                      setBioDraft(bio);
                      setEditingBio(true);
                    }}
                    className="mt-2 text-yellow-400 underline mx-auto block"
                    disabled={loading}
                  >
                    Edit Bio
                  </button>
                </>
              )}
              {editingBio && (
                <>
                  <textarea
                    rows={4}
                    className="w-full p-2 rounded text-black"
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex gap-4 mt-2 justify-center">
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const newImage = imagePreview || profileImage;
                          await profileUpdateStore.updateProfile(
                            bioDraft,
                            newImage,
                            showToast,
                          );
                          setBio(bioDraft);
                          setProfileImage(newImage);
                          setEditingBio(false);
                          setImageFile(null);
                          setImagePreview(null);
                        } catch {
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="bg-yellow-400 text-black px-4 py-1 rounded disabled:opacity-50"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingBio(false);
                        setBioDraft('');
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="bg-gray-600 px-4 py-1 rounded"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="px-2 pb-4">
              <hr className="border-t border-white my-2" />
            </div>
          </div>

          <div className="pb-6 px-2 py-4 border border-white bg-black text-white rounded-xl shadow-lg w-full mx-auto flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold">{showcampaigns}</p>
              <p className="text-xs">Campaigns</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{posts}</p>
              <p className="text-xs">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{submissions}</p>
              <p className="text-xs">Submissions</p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-4/5 space-y-6">
          <NotificationsSection
            notifications={notifications}
            show={showNotifications}
            toggleShow={() => setShowNotifications(!showNotifications)}
            message={message}
          />

          <CampaignsSection
            campaigns={campaigns}
            message={message}
            expanded={expandedCards}
            onExpandToggle={handleToggleExpand}
            onCampaignAction={handleCampaignAction}
            notificationOpen={showNotifications}
          />
        </div>
      </div>
    </div>
  );
};

export default InfluencerPage;
