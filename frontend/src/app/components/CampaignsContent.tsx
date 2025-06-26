import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import ProfileWithStats from '../components/ProfileCard';
import CreateCampaignModal from '../components/CreateCampaignModal';
import { getRandom } from '../utils/random';

interface CampaignType {
  title: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  date: string;
}

const CampaignsContent: React.FC = () => {
  const message =
    'This is a detailed campaign description with instructions. It is expandable when the user clicks "Read More".';

  const [campaigns, setCampaigns] = useState<CampaignType[]>([
    {
      title: 'Campaign 1',
      description: message,
      image: '/images/fit.jpg',
      status: 'active',
      date: '16/01/2025',
    },
  ]);

  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const maxCharCount = 70;

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(({ title, status }) => {
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status === 'active') ||
        (statusFilter === 'inactive' && status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const toggleExpand = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  const deleteCampaign = (title: string) => {
    setCampaigns((prev) => prev.filter((c) => c.title !== title));
  };

  return (
    <div className="relative w-full p-12">
      <CreateCampaignModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={(newCampaign) =>
          setCampaigns((prev) => [...prev, newCampaign])
        }
      />

      <div className="flex flex-row space-x-8">
        <div className="w-1/5">
          <ProfileWithStats
            username="John Doe"
            profileImage="/images/screenshots/HandM.jpg"
            bio="Welcome to your campaign dashboard!"
            likes={getRandom(50, 300)}
            shares={getRandom(10, 100)}
            campaigns={campaigns.length}
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
                onChange={(e) => setStatusFilter(e.target.value as any)}
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
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 items-center text-white font-semibold px-4 py-2 rounded-xl shadow"
            >
              + Create Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const isExpanded = expanded[campaign.title];
              const displayedText = isExpanded
                ? campaign.description
                : `${campaign.description.slice(0, maxCharCount)}${campaign.description.length > maxCharCount ? '...' : ''}`;

              return (
                <div
                  key={campaign.title}
                  className="bg-black text-white p-1 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                >
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    width={500}
                    height={300}
                    className="rounded-2xl w-full h-[150px] object-cover"
                  />

                  <div className="bg-black text-white p-3 rounded-b-xl">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{campaign.title}</p>
                      <p className="text-xs">{campaign.date}</p>
                    </div>
                    <p className="text-xs mt-2">{displayedText}</p>

                    {campaign.description.length > maxCharCount && (
                      <button
                        onClick={() => toggleExpand(campaign.title)}
                        className="text-red-400 hover:underline text-xs mt-1"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs font-semibold">Deadline: 2 weeks</p>
                      <p
                        className={`text-xs font-bold ${campaign.status === 'active' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteCampaign(campaign.title)}
                      className="mt-2 px-3 py-1 text-sm bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-1/5 space-y-8">
          <div className="bg-[#E8BB5B] text-white p-6 rounded-2xl text-center hover:shadow-lg transition duration-300 transform hover:scale-105">
            <h4 className="text-xl font-bold">Notifications</h4>
            <h4 className="text-4xl text-red-600 font-bold">2</h4>
            <p className="text-xs ml-2 inline-block align-top">New</p>
            <p className="text-sm mt-2">Sport Campaign</p>
            <p className="text-xs">16/01/2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsContent;
