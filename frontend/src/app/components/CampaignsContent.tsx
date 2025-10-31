import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Pencil, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ProfileWithStats from '../components/ProfileCard';
import CreateCampaignModal from '../components/CreateCampaignModal';
import { getRandom } from '../utils/random';
import NotificationWidget from '../components/NotificationWidget';
import { profileUpdateStore } from '@/rxjs/profileUpdateStore';
import { authState$ } from '@/rxjs/authStore';
import { campaignStore } from '@/rxjs/campaignStore';
import { submissions$, submissionStore } from '@/rxjs/submissionStore';
import { SubmissionType } from '@/types';
import { CampaignType } from '../../types';
import { useSpring, animated } from '@react-spring/web';

const notifications = [
  {
    id: 1,
    campaign: 'Sport Campaign',
    status: 'accepted',
    date: '16/01/2025',
    message: 'Your submission for Sport Campaign has been approved.',
  },
  {
    id: 2,
    campaign: 'Music Fest',
    status: 'rejected',
    date: '15/01/2025',
    message: 'Unfortunately, your submission for Music Fest was not approved.',
  },
];

const CampaignsContent: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [campaignSubmissions, setCampaignSubmissions] = useState<
    SubmissionType[]
  >([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [showSubmissions, setShowSubmissions] = useState(false);

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(
    '/images/screenshots/HandM.jpg',
  );

  const { showToast } = useToast();

  const [likes] = useState(getRandom(50, 200));
  const [shares] = useState(getRandom(10, 100));
  const [posts] = useState(getRandom(5, 15));
  const [submissions] = useState(getRandom(2, 10));

  const maxCharCount = 70;

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
    const sub = campaignStore.campaigns$.subscribe(setCampaigns);
    campaignStore.fetchCampaigns();
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;

    const sub = submissions$.subscribe(
      (allSubs: Record<string, SubmissionType[]>) => {
        setCampaignSubmissions(allSubs[selectedCampaign.id] || []);
      },
    );

    submissionStore.fetchSubmissions(selectedCampaign.id);

    return () => sub.unsubscribe();
  }, [selectedCampaign]);

  const handleProfileSave = async (
    newBio: string,
    newImage: File | string | null,
  ) => {
    setLoading(true);
    try {
      const imagePath = await profileUpdateStore.updateProfile(
        newBio,
        newImage!,
        showToast,
      );
      setBio(newBio);
      setProfileImage(imagePath);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleViewSubmissions = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    setShowSubmissions(true);
  };

  const handleCloseSubmissions = () => setShowSubmissions(false);

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

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize);
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, currentPage]);

  const slideIn = useSpring({
    transform: showSubmissions ? 'translateX(0)' : 'translateX(100%)',
    opacity: showSubmissions ? 1 : 0,
    config: { tension: 300, friction: 30 },
  });

  return (
    <div className="relative w-full p-6 sm:p-8 md:p-12">
      <CreateCampaignModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaignToEdit={selectedCampaign}
        onCreate={() => {
          setSelectedCampaign(null);
        }}
      />

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="w-full lg:w-1/4">
          {profileImage && (
            <ProfileWithStats
              username={username}
              profileImage={profileImage}
              bio={bio}
              likes={likes}
              shares={shares}
              campaigns={campaigns.length}
              posts={posts}
              submissions={submissions}
              onSave={handleProfileSave}
              loading={loading}
              showToast={showToast}
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-1/2 px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="relative w-full sm:w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as 'all' | 'active' | 'inactive',
                  );
                  setCurrentPage(1);
                }}
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
              onClick={() => {
                setSelectedCampaign(null);
                setCreateModalOpen(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 items-center text-white font-semibold px-4 py-2 rounded-xl shadow"
            >
              + Create Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14">
            {paginatedCampaigns.map((campaign) => {
              const isExpanded = expanded[campaign.title];
              const description = campaign.instructions;
              const displayedText = isExpanded
                ? description
                : `${description.slice(0, maxCharCount)}${
                    description.length > maxCharCount ? '...' : ''
                  }`;

              return (
                <div
                  key={campaign.id}
                  className="bg-black text-white p-1 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300 w-[240px] max-w-xs"
                >
                  <Image
                    src={campaign.images[0] || '/images/campaign.jpg'}
                    alt={campaign.title}
                    width={500}
                    height={300}
                    className="rounded-2xl w-full h-[150px] object-cover"
                  />
                  <div className="bg-black text-white p-3 rounded-b-xl">
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-xs mt-2">{displayedText}</p>

                    {description.length > maxCharCount && (
                      <button
                        onClick={() => toggleExpand(campaign.title)}
                        className="text-red-400 hover:underline text-xs mt-1"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}

                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs">
                        <p>Start: {campaign.startDate}</p>
                        <p>End: {campaign.endDate}</p>
                      </div>
                      <p
                        className={`text-xs font-bold ${
                          campaign.status === 'active'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-1 mt-3">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setCreateModalOpen(true);
                        }}
                        className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 text-xs rounded hover:bg-yellow-600"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          campaignStore.deleteCampaign(campaign.id)
                        }
                        className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(campaign)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8 space-x-4 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <NotificationWidget notifications={notifications} />
      </div>

      <animated.div
        style={slideIn}
        className="fixed inset-0 z-50 flex justify-end bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 bg-opacity-80"
      >
        <div className="flex w-full h-full overflow-hidden rounded-l-2xl shadow-2xl">
          <div className="flex-1 bg-gradient-to-b from-black-700 via-pink-600 to-pink-800 text-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Influencer Submissions</h2>
              <button
                onClick={handleCloseSubmissions}
                className="bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>

            {selectedCampaign && (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedCampaign.title}
                </h3>

                <h4 className="text-lg font-semibold mb-3">
                  Submissions ({campaignSubmissions.length})
                </h4>

                {campaignSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {campaignSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-black backdrop-blur-sm border border-white-500 p-4 rounded-xl shadow-md hover:shadow-lg transition"
                      >
                        <p className="font-semibold text-white mb-1">
                          {sub.influencerName || 'Anonymous Influencer'}
                        </p>
                        <p className="text-sm text-purple-100 mb-2 line-clamp-3">
                          {sub.content}
                        </p>
                        <p className="text-xs text-purple-300">
                          {new Date(sub.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-200 italic">No submissions yet.</p>
                )}
              </>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 p-6 border-l border-gray-200 flex flex-col justify-between">
            {selectedCampaign && (
              <>
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">
                    Overview
                  </h4>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Total Submissions:</strong>{' '}
                      {campaignSubmissions.length}
                    </p>
                    <p>
                      <strong>Start Date:</strong> {selectedCampaign.startDate}
                    </p>
                    <p>
                      <strong>End Date:</strong> {selectedCampaign.endDate}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={`font-bold ${
                          selectedCampaign.status === 'active'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {selectedCampaign.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-white/60 p-4 rounded-xl shadow-inner">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Quick Stats
                  </h5>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Accepted:</span>
                    <span className="font-medium text-green-600">
                      {
                        campaignSubmissions.filter(
                          (s) => s.status === 'accepted',
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Rejected:</span>
                    <span className="font-medium text-red-600">
                      {
                        campaignSubmissions.filter(
                          (s) => s.status === 'rejected',
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default CampaignsContent;
