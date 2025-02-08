import React, { useState } from 'react';
import Image from 'next/image';
import UserMenu from '../app/components/UserMenu';

const InfluencerPage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="bg-[#E8BB5B] p-8 min-h-screen">
      <div className="absolute top-2 right-28 z-50">
        <UserMenu />
      </div>

      <div className="flex justify-center items-start mb-8 space-x-4">
        <div className="w-1/4 space-y-4">
          <div className="p-4 bg-black text-white rounded-2xl relative overflow-hidden shadow-lg">
            <div className="relative">
              <Image
                src="/images/image4.png"
                alt="Brad"
                width={150}
                height={200}
                className="rounded-full w-32 h-32 mx-auto mb-4"
              />
              <div className="absolute top-4 left-4 text-center">
                <div className="bg-[#FFD700] text-black text-sm font-bold p-2 rounded-full">
                  100 likes
                </div>
                <div className="bg-[#FFD700] text-black text-sm font-bold p-2 mt-2 rounded-full">
                  50 shares
                </div>
              </div>
            </div>
            <h2 className="text-center text-3xl font-bold mb-2">BRAD</h2>
            <p className="text-center text-sm">Influencer Network</p>
            <p className="text-center text-gray-400 text-sm">16/01/2025</p>
            <p className="text-center text-sm mt-4 px-2">
              Join our Influencer Network today! My name is [Your Name] from
              [Your Brand], and we would love to have you onboard. We love how
              your content aligns with our brand!
            </p>
          </div>

          <div className="border border-white bg-black text-white rounded-xl shadow-lg w-full max-w-xl mx-auto mt-2 p-2 flex justify-around">
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
          <h4 className="text-xl font-bold text-center">Campaigns</h4>
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
                <p className="text-gray-700">
                  I hope this message finds you well! My name is [Your Name]
                  from [Your Brand]...
                </p>
                <p className="font-semibold text-blue-500 mt-2">
                  Deadline: 2 weeks
                </p>
                <p
                  className={`font-bold ${index % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}
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
                  src="/images/fit.jpg"
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
