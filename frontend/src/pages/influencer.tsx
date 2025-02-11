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

      <h1 className="text-3xl text-[#FFFF00] underline mb-1 pb-1 decoration-2 underline-offset-2 text-center ml-2 -mt-2">
        My Profile
      </h1>

      <div className="flex justify-center items-start mb-8 space-x-4">
        <div className="w-1/5 space-y-12 self-start mt-8">
          <div className="p-1 bg-black text-white rounded-2xl relative overflow-hidden shadow-lg hover:overflow-y-auto">
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
            <div className="border-t border-b border-white py-6 px-2 mb-6 mt-4 h-48 overflow-y-auto"> {/* Added scrollbar */}
              <div className="flex justify-center text-xs mt-2">
                <p>Influencer Network</p>
                <p className="text-gray-400 ml-6">16/01/2025</p>
              </div>
              <p className="text-center text-xs mt-6 px-18 max-w-full">
                <span className="block mb-2 mt-6 px-1">
                  Join our Influencer Network today!
                </span>
                My name is [Your Name] from [Your Brand], and we would love to
                have you onboard. We love how your content aligns with our
                brand!
              </p>
            </div>
          </div>
          <div className="border border-white bg-black text-white rounded-xl shadow-lg w-full max-w-xl mx-auto mt-8 p-1 flex justify-around">
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
          <h4 className="text-xl text-center underline">Campaigns</h4>
          <div className="grid grid-cols-3 gap-4">
            {['Campaign 1', 'Campaign 2', 'Campaign 3'].map((title, index) => (
              <div
                key={index}
                className={`relative bg-black text-white p-1 rounded-xl shadow-lg transform transition duration-300 border border-black ${
                  activeCard === title
                    ? 'scale-105 ring-4 ring-blue-500'
                    : 'hover:scale-105 hover:ring-2 hover:ring-blue-300'
                }`}
                onClick={() => setActiveCard(title)}
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
                  <p className="text-xs mt-2">
                    I hope this message finds you well! My name is [Your Name]
                    from [Your Brand]...
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-semibold">Deadline: 2 weeks</p>
                    <p
                      className={`text-xs font-bold ${index % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {index % 2 === 0 ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FFD700] p-4 rounded-2xl shadow-lg">
            <h4 className="text-xl font-bold mb-4 text-center">
              Notifications
            </h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-lg flex items-start space-x-4 text-sm">
                <Image
                  src="/images/fit.jpg"
                  alt="Sports Campaign"
                  width={150}
                  height={200}
                  className="w-16 h-16 rounded-lg"
                />
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-blue-500">Sports Campaign</p>
                    <p className="text-green-500 font-semibold">
                      Submission Accepted
                    </p>
                    <p className="text-gray-500">16/01/2025</p>
                  </div>
                  <p className="text-gray-700">
                    I hope this message finds you well! My name is [Your Name]
                    from [Your Brand], and we're excited to invite you to join
                    our influencer network. We've been following your content on
                    [Platform] and love how it aligns with our brand!
                  </p>
                </div>
              </div>

              <div className="bg-gray-200 p-4 rounded-xl shadow-lg flex items-start space-x-4 text-sm">
                <Image
                  src="/images/images.jpg"
                  alt="Fashion Campaign"
                  width={150}
                  height={200}
                  className="w-16 h-16 rounded-lg"
                />
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-blue-500">Fashion Campaign</p>
                    <p className="text-red-500 font-semibold">
                      Submission Rejected
                    </p>
                    <p className="text-gray-500">15/01/2025</p>
                  </div>
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
