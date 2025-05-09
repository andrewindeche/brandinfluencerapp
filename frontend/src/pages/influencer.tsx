import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import UserMenu from '../app/components/UserMenu';
import { useRoleGuard } from '../hooks/useRoleGuard';
import NotificationCard from '../app/components/NotificationCard';
import { useToast } from '../hooks/useToast';

const MAX_CHAR_COUNT = 70;

const InfluencerPage: React.FC = () => {
  useRoleGuard(['influencer']);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { toast, showToast, closeToast } = useToast();
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({});

  const message = `I hope this message finds you well! My name is [Your Name] from [Your Brand], and we would love to have you onboard. We love how your content aligns with our brand! Your engagement metrics are phenomenal, and we believe our partnership will bring great value to both sides.`;

  const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];

  // Close toast after 3 seconds
  useEffect(() => {
    if (toast) {
      setTimeout(() => {
        closeToast();
      }, 3000);
    }
  }, [toast, closeToast]);

  // Example campaign action handler
  const handleCampaignAction = (campaign: string) => {
    showToast(`${campaign} was successfully updated!`, 'success');
  };

  // Toggle expand/collapse for campaign messages
  function handleToggleExpand(title: string): void {
    setExpandedCards((prevState) => ({
      ...prevState,
      [title]: !prevState[title],
    }));
  }

  return (
    <div className="bg-[#E8BB5B] p-12 min-h-screen">
      <div className="absolute top-2 right-28 z-50">
        <UserMenu userName={''} imageSrc={''} />
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 text-white px-4 py-3 rounded shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl text-[#FFFF00] underline mb-1 pb-1 decoration-2 underline-offset-2 text-center ml-2 -mt-2">
        My Profile
      </h1>

      <div className="flex justify-center items-start mb-8 space-x-4">
        <div className="w-1/5 space-y-12 self-start mt-8">
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
              <div className="absolute transform -translate-x-1/2 rotate-12 bg-opacity-30 px-20 py-3 bottom-6 left-1/2 text-lg bg-[#333333] text-white p-2 rounded-full z-10">
                <span className="inline-block transform -rotate-12 text-white">
                  BRAD
                </span>
              </div>
              <div className="absolute top-4 left-1 text-center z-10">
                <div className="bg-[#333333] rotate-12 bg-opacity-30 text-xs p-3 rounded-full">
                  <span className="inline-block transform -rotate-12 text-white">
                    100 likes
                  </span>
                </div>
                <div className="bg-[#333333] rotate-12 bg-opacity-30 text-xs p-3 mt-1 rounded-full">
                  <span className="inline-block transform -rotate-12 text-white">
                    50 shares
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-b border-white py-4 px-2">
              <div className="flex justify-center text-xs mt-2">
                <p>Influencer Network</p>
                <p className="text-gray-400 ml-6">16/01/2025</p>
              </div>
            </div>
            <div
              className={`h-24 px-2 mt-2 ${isHovered ? 'overflow-y-auto' : 'overflow-hidden'}`}
            >
              <p className="text-center text-sm max-w-full">{message}</p>
            </div>
            <div className="px-2 pb-4">
              <hr className="border-t border-white my-2" />
            </div>
          </div>

          <div className="pb-6 px-2 py-4 border border-white bg-black text-white rounded-xl shadow-lg w-full max-w-xl mx-auto mt-8 p-1 flex justify-around">
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

        <div className="w-2/3 space-y-4">
          <div className="p-4 rounded-2xl shadow-lg">
            <h4 className="text-xl font-bold mb-2 text-center underline">
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

          <div className="p-2 rounded-2xl shadow-lg">
            <h4 className="p-3 text-xl text-center underline">Campaigns</h4>
            <div className="grid grid-cols-3 gap-4">
              {campaigns.map((title, index) => {
                const isExpanded = expandedCards[title];
                const displayedText = isExpanded
                  ? message
                  : `${message.slice(0, MAX_CHAR_COUNT)}${message.length > MAX_CHAR_COUNT ? '...' : ''}`;

                return (
                  <div
                    key={index}
                    className={`relative bg-black text-white p-1 rounded-xl shadow-lg transform transition duration-300 border border-black ${
                      activeCard === title
                        ? 'scale-105 ring-4 ring-blue-500'
                        : 'hover:scale-105 hover:ring-2 hover:ring-blue-300'
                    }`}
                    onClick={() => {
                      setActiveCard(title);
                      handleCampaignAction(title); // Call the toast notification here
                    }}
                  >
                    <Image
                      src="/images/fit.jpg"
                      alt={title}
                      width={200}
                      height={150}
                      className="rounded-2xl w-full h-[150px] object-cover"
                    />
                    <div className="bg-[#005B96] text-white p-2 rounded-b-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs">{'16/01/2025'}</p>
                      </div>
                      <p className="text-xs mt-2">{displayedText}</p>
                      {message.length > MAX_CHAR_COUNT && (
                        <button
                          onClick={() => handleToggleExpand(title)}
                          className="text-red-400 hover:underline"
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
