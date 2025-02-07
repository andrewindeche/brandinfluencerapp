import React from 'react';
import ProfileCard from '../components/ProfileCard';
import Image from 'next/image';

const CampaignsContent: React.FC = () => {
  return (
    <div className="relative w-full px-12">
      <div className="flex flex-row space-x-4">
        <div className="w-1/5">
          <ProfileCard />
        </div>

        <div className="flex-1 rounded-lg shadow-lg">
          <div className="p-4 grid grid-cols-3 gap-4 text-white rounded-lg border border-white justify-between">
            {[
              { title: 'Ambassadors', value: '12' },
              { title: 'Total reach', value: '9.8K' },
              { title: 'Submissions', value: '20' },
              { title: 'Posts', value: '30K' },
              { title: 'Likes', value: '5K' },
              { title: 'Comments', value: '60.2K' },
            ].map((stat) => (
              <div
                key={stat.title}
                className="text-center p-1 rounded-lg bg-gradient-to-r from-yellow-500 to-red-600 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
              >
                <h4 className="text-sm">{stat.title}</h4>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-2 text-center py-2">
              New Campaigns
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 h-60 overflow-y-hidden hover:overflow-y-auto">
              {[
                { title: 'Title 1', src: '/images/fit.jpg' },
                { title: 'Title 2', src: '/images/images.jpg' },
                { title: 'Title 3', src: '/images/download.jpg' },
                { title: 'Title 4', src: '/images/download.jpg' },
                { title: 'Title 5', src: '/images/fit.jpg' },
                { title: 'Title 6', src: '/images/images.jpg' },
                { title: 'Title 7', src: '/images/download.jpg' },
                { title: 'Title 8', src: '/images/fit.jpg' },
              ].map((campaign) => (
                <div
                  key={campaign.title}
                  className="bg-black rounded-lg text-white p-4 transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    src={campaign.src}
                    alt={campaign.title}
                    width={50}
                    height={70}
                    className="rounded-t-lg transition duration-300 ease-in-out transform hover:scale-110"
                  />
                  <p className="text-center mt-2">{campaign.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/5">
          <div className="bg-[#E8BB5B] text-white p-6 rounded-lg text-center hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <h4 className="text-4xl font-bold">2</h4>
            <p className="text-sm mt-2">Sport Campaign</p>
            <p className="text-xs mt-4">New</p>
            <p className="text-xs">16/01/2025</p>
          </div>

          <div className="bg-black text-white mt-4 p-4 rounded-lg text-center transition-transform transform hover:scale-105 hover:shadow-lg">
            <Image
              src="/images/image1.png"
              alt="New Submission"
              width={100}
              height={100}
              className="rounded-t-lg transition-transform transform hover:scale-110"
            />
            <p className="mt-2">Social Media</p>
            <p className="text-xs mt-2">16/01/2025</p>
            <p className="text-xs mt-2">Join our TikTok account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsContent;
