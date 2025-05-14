import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import UserMenu from '../app/components/UserMenu';
import NotificationCard from '../app/components/NotificationCard';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { useToast } from '../hooks/useToast';
import router from 'next/router';
import { formState$ } from '@/rxjs/store';

const MAX_CHAR_COUNT = 70;

const InfluencerPage: React.FC = () => {
  const { authorized, checked } = useRoleGuard(['influencer']);
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});
  const [isHovered, setIsHovered] = useState(false);
  const { toast, showToast } = useToast();
  const [username, setUsername] = useState('');

  const message = `I hope this message finds you well! My name is [Your Name] from [Your Brand], and we would love to have you onboard. We love how your content aligns with our brand! Your engagement metrics are phenomenal, and we believe our partnership will bring great value to both sides.`;
  const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];

  useEffect(() => {
    const sub = formState$.subscribe((state) => {
      setUsername(state.username);
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
          imageSrc="/images/image4.png"
          onLogout={handleLogout}
        />
      </div>

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 text-white px-4 py-3 rounded shadow-lg transition-all duration-300 ease-in-out ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
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
            <div className="relative">
              <Image
                src="/images/image4.png"
                alt="Brad"
                width={200}
                height={150}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute transform -translate-x-1/2 rotate-12 px-20 py-3 bottom-6 left-1/2 text-lg bg-black/30 text-white p-2 rounded-full z-10">
                <span className="inline-block transform -rotate-12">BRAD</span>
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
              <p className="text-center text-sm md:text-base">{message}</p>
            </div>
            <div className="px-2 pb-4">
              <hr className="border-t border-white my-2" />
            </div>
          </div>

          <div className="pb-6 px-2 py-4 border border-white bg-black text-white rounded-xl shadow-lg w-full mx-auto flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold">10</p>
              <p className="text-xs">Campaigns</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">8</p>
              <p className="text-xs">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">17</p>
              <p className="text-xs">Submissions</p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-4/5 space-y-6">
          <div className="p-4 rounded-2xl shadow-lg bg-white">
            <h4 className="text-xl font-bold text-center text-black mb-4">
              Notifications
            </h4>
            <div className="space-y-4">
              <NotificationCard
                imageSrc="/images/fit.jpg"
                campaignName="Sports Campaign"
                status="accepted"
                date="16/01/2025"
                message={message}
              />
              <NotificationCard
                imageSrc="/images/images.jpg"
                campaignName="Fashion Campaign"
                status="rejected"
                date="12/01/2025"
                message={message}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl shadow-lg bg-white">
            <h4 className="text-xl font-bold text-center text-black mb-4">
              Campaigns
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((title, index) => {
                const isExpanded = expandedCards[title];
                const displayedText = isExpanded
                  ? message
                  : `${message.slice(0, MAX_CHAR_COUNT)}${message.length > MAX_CHAR_COUNT ? '...' : ''}`;

                return (
                  <div
                    key={index}
                    className="relative bg-black text-white p-1 rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:ring-2 hover:ring-blue-300"
                    onClick={() => handleCampaignAction(title)}
                  >
                    <Image
                      src="/images/fit.jpg"
                      alt={title}
                      width={500}
                      height={300}
                      className="rounded-2xl w-full h-[150px] object-cover"
                    />
                    <div className="bg-[#005B96] text-white p-2 rounded-b-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs">16/01/2025</p>
                      </div>
                      <p className="text-xs mt-2">{displayedText}</p>
                      {message.length > MAX_CHAR_COUNT && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(title);
                          }}
                          className="text-red-400 hover:underline text-xs mt-1"
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs font-semibold">
                          Deadline: 2 weeks
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            index % 2 === 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {index % 2 === 0 ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerPage;
