import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import ProfileWithStats from '../components/ProfileCard';
import SubmissionModal from '../components/SubmissionModal';
import { getRandom } from '../utils/random';

type StatusFilter = 'all' | 'active' | 'inactive';

const CampaignsContent: React.FC = () => {
  const campaigns = useMemo(
    () => ['Campaign 1', 'Campaign 2', 'Campaign 3', 'Campaign 4'],
    [],
  );

  const message =
    'This is a detailed campaign description with instructions. It is expandable when the user clicks "Read More".';

  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const maxCharCount = 70;

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((title, index) => {
      const isActive = index % 2 === 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) && matchesStatus
      );
    });
  }, [campaigns, searchQuery, statusFilter]);

  const toggleExpand = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <div className="relative w-full p-12">
      <div className="flex flex-row space-x-8">
        <div className="w-1/5">
          <ProfileWithStats
            username="John Doe"
            profileImage="/images/screenshots/HandM.jpg"
            bio="Welcome to your campaign dashboard!"
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

        <div className="flex-1">
          <h3 className="text-white text-xl font-bold mb-4 text-center">
            Your Campaigns
          </h3>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="relative w-full sm:w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full appearance-none px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div className="p-1 grid grid-cols-3 gap-1 text-white rounded-lg border border-white mb-6">
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
                className="text-center rounded-lg bg-gradient-to-r from-zinc-800 to-black transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
              >
                <h4 className="text-lg">{stat.title}</h4>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((title, index) => {
              const isExpanded = expanded[title];
              const isActive = index % 2 === 0;
              const displayedText = isExpanded
                ? message
                : `${message.slice(0, maxCharCount)}${message.length > maxCharCount ? '...' : ''}`;

              return (
                <div
                  key={title}
                  className="bg-black text-white p-1 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                  onClick={() => {
                    setSelectedCampaign(title);
                    setModalOpen(true);
                  }}
                >
                  <Image
                    src="/images/fit.jpg"
                    alt={title}
                    width={500}
                    height={300}
                    className="rounded-2xl w-full h-[150px] object-cover"
                  />

                  <div className="bg-black text-white p-3 rounded-b-xl">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{title}</p>
                      <p className="text-xs">16/01/2025</p>
                    </div>
                    <p className="text-xs mt-2">{displayedText}</p>

                    {message.length > maxCharCount && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(title);
                        }}
                        className="text-red-400 hover:underline text-xs mt-1"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs font-semibold">Deadline: 2 weeks</p>
                      <p
                        className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(title);
                        setModalOpen(true);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <SubmissionModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            campaignTitle={selectedCampaign ?? ''}
            imageSrc="/images/fit.jpg"
            message={message}
            onSubmit={(text) => {
              console.log(`Submitted for ${selectedCampaign}:`, text);
              setModalOpen(false);
            }}
          />
        </div>

        <div className="w-1/5 space-y-8">
          <div className="bg-[#E8BB5B] text-white p-6 rounded-2xl text-center hover:shadow-lg transition duration-300 transform hover:scale-105">
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
