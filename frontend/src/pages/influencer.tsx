import React, { useState } from 'react';
import Image from 'next/image';
import UserMenu from '../app/components/UserMenu';

const InfluencerPage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="bg-[#E8BB5B] p-12 min-h-screen">
      <div className="absolute top-2 right-28 z-50">
        <UserMenu />
      </div>

      <h1 className="text-3xl text-[#FFFF00] underline text-center mb-8 pb-2 decoration-[underline] decoration-2 underline-offset-2">
        My Profile
      </h1>

      <div className="flex justify-center items-start mb-8 space-x-4">
        <div className="w-1/5 space-y-1 self-start mt-8">
          <div className="p-1 bg-black text-white rounded-2xl relative overflow-hidden shadow-lg">
            <div className="relative">
              <Image
                src="/images/image4.png"
                alt="Brad"
                width={200}
                height={150}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-lg font-bold bg-[#333333] text-white p-2 rounded-full z-10">
                BRAD
              </div>
              <div className="absolute top-4 right-4 text-center z-10">
                <div className="bg-[#333333] text-white text-xs font-bold p-3 rounded-full">
                  100 likes
                </div>
                <div className="bg-[#333333] text-white text-xs font-bold p-3 mt-1 rounded-full">
                  50 shares
                </div>
              </div>
            </div>
            <div className="flex justify-center text-xs mt-2">
              <p>Influencer Network</p>
              <p className="text-gray-400 ml-2">16/01/2025</p>
            </div>
            <p className="text-center text-xs mt-1 px-4">
              <span className="block mb-2">
                Join our Influencer Network today!
              </span>
              My name is [Your Name] from [Your Brand], and we would love to
              have you onboard. We love how your content aligns with our brand!
            </p>
          </div>
          <div className="border border-white bg-black text-white rounded-xl shadow-lg w-full max-w-xl mx-auto mt-1 p-1 flex justify-around">
            <div className="text-center">
              <p className="text-xl font-bold">10</p>
              <p className="text-sm">Campaigns</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">8</p>
              <p className="text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">17</p>
              <p className="text-sm">Submissions</p>
            </div>
          </div>
        </div>

        <div className="w-2/3 space-y-4">
          <h4 className="text-xl font-bold text-center underline">Campaigns</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Campaign 1', 'Campaign 2', 'Campaign 3'].map((title, index) => (
              <div
                key={index}
                className={`bg-white p-4 rounded-xl shadow-lg transform transition duration-300 ${
                  activeCard === title
                    ? 'scale-105 ring-4 ring-blue-500'
                    : 'hover:scale-105 hover:ring-2 hover:ring-blue-300'
                }`}
                onClick={() => setActiveCard(title)}
              >
                <Image
                  src="/images/fit.jpg"
                  alt={title}
                  width={150}
                  height={200}
                  className="rounded-lg w-full mb-4"
                />
                <p className="font-bold">{title}</p>
                <p className="text-gray-600">16/01/2025</p>
                <p className="text-gray-300">
                  I hope this message finds you well! My name is [Your Name]
                  from [Your Brand]...
                </p>
                <p className="font-semibold text-blue-500 mt-2">
                  Deadline: 2 weeks
                </p>
                <p
                  className={`font-bold ${
                    index % 2 === 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {index % 2 === 0 ? 'Active' : 'Inactive'}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-[#FFD700] p-4 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-lg flex items-start">
                <Image
                  src="/images/fit.jpg"
                  alt="Sports Campaign"
                  width={150}
                  height={200}
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <div>
                  <p className="font-bold text-blue-500">Sports Campaign</p>
                  <p className="text-green-500 font-semibold">
                    Submission Accepted
                  </p>
                  <p className="text-gray-500">16/01/2025</p>
                  <p className="text-gray-700">
                    I hope this message finds you well! My name is [Your Name]
                    from [Your Brand], and we're excited to invite you to join
                    our influencer network. We've been following your content on
                    [Platform] and love how it aligns with our brand!
                  </p>
                </div>
              </div>

              <div className="bg-gray-200 p-4 rounded-xl shadow-lg flex items-start">
                <Image
                  src="/images/images.jpg"
                  alt="Fashion Campaign"
                  width={150}
                  height={200}
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <div>
                  <p className="font-bold text-blue-500">Fashion Campaign</p>
                  <p className="text-red-500 font-semibold">
                    Submission Rejected
                  </p>
                  <p className="text-gray-500">15/01/2025</p>
                  <p className="text-gray-700">
                    I hope this message finds you well! My name is [Your Name]
                    from [Your Brand], and we're excited to invite you to join
                    our influencer network. We've been following your content on
                    [Platform] and love how it aligns with our brand!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerPage;
