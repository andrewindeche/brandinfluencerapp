import React from 'react';
import ProfileWithStats from '../components/ProfileCard';
import Image from 'next/image';
import { getRandom } from '../utils/random';

const CampaignsContent: React.FC = () => {
  return (
    <div className="relative w-full p-12">
      <div className="flex flex-row space-x-8">
        <div className="w-1/5">
          <ProfileWithStats
            username="John Doe"
            profileImage="/images/screenshots/HandM.jpg"
            bio="Lifestyle content creator and influencer. Passionate about fashion and fitness."
            likes={getRandom(50, 300)}
            shares={getRandom(10, 100)}
            campaigns={getRandom(1, 10)}
            posts={getRandom(3, 25)}
            submissions={getRandom(1, 15)}
            onSave={async (newBio, newImage) => {
              console.log('Saving...', newBio, newImage);
              await new Promise((res) => setTimeout(res, 1000));
            }}
            showToast={(msg, type) => alert(`[${type.toUpperCase()}]: ${msg}`)}
          />
        </div>
        <div className="flex-1 rounded-lg shadow-lg">
          <div className="p-1 grid grid-cols-3 gap-1 text-white rounded-lg border border-white">
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
                className="text-center rounded-lg bg-gradient-to-r transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
              >
                <h4 className="text-lg">{stat.title}</h4>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-white text-lg font-bold my-4 text-center">
              New Campaigns
            </h3>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search for new campaigns..."
                className="w-full px-4 py-2 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 h-60 overflow-y-hidden hover:overflow-y-auto">
              {[
                { title: 'Title 1', src: '/images/fit.jpg' },
                { title: 'Title 2', src: '/images/images.jpg' },
                { title: 'Title 3', src: '/images/download.jpg' },
                { title: 'Title 4', src: '/images/download.jpg' },
                { title: 'Title 5', src: '/images/fit.jpg' },
                { title: 'Title 6', src: '/images/images.jpg' },
              ].map((campaign) => (
                <div
                  key={campaign.title}
                  className="bg-black rounded-2xl text-white p-4 transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="relative h-20 w-full group">
                    <Image
                      src={campaign.src}
                      alt={campaign.title}
                      layout="fit"
                      width="300"
                      height="200"
                      objectFit="cover"
                      className="w-30 h-20 rounded-2xl transition duration-300 ease-in-out transform group-hover:scale-110"
                    />
                    {campaign.title === 'Social Media' && (
                      <p className="absolute bottom-0 left-0 w-full text-xs text-white bg-black bg-opacity-75 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        New Submission
                      </p>
                    )}
                  </div>
                  <p className="text-center mt-2">{campaign.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/5 space-y-8">
          <div className="bg-[#E8BB5B] text-white p-6 rounded-2xl text-center hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            <h4 className="text-xl font-bold">Notifications</h4>
            <h4 className="text-4xl text-red-600 font-bold">2</h4>
            <p className="text-xs ml-2 inline-block align-top">New</p>
            <p className="text-sm mt-2">Sport Campaign</p>
            <p className="text-xs">16/01/2025</p>
          </div>

          <div className="bg-black text-white p-4 rounded-2xl text-center transition-transform transform hover:scale-105 hover:shadow-lg">
            <div className="relative w-full h-60 group">
              <Image
                src="/images/image1.png"
                alt="New Submission"
                layout="fill"
                objectFit="cover"
                className="w-full h-auto rounded-2xl transition-transform transform group-hover:scale-110"
              />
              <p className="absolute bottom-0 left-0 w-full text-xs text-white bg-black bg-opacity-75 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                New Submission
              </p>
            </div>
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
