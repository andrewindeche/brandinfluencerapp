'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown, Pencil, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ProfileWithStats from './ProfileCard';
import CreateCampaignModal from './CreateCampaignModal';
import { getRandom } from '../utils/random';
import NotificationWidget from './NotificationWidget';
import { profileUpdateStore } from '@/rxjs/profileUpdateStore';
import { authState$ } from '@/rxjs/authStore';
import { campaignStore } from '@/rxjs/campaignStore';
import { submissions$, submissionStore } from '@/rxjs/submissionStore';
import { SubmissionType } from '@/interfaces';
import { CampaignType } from '../../types';
import { NotificationType } from '@/interfaces';
import { useSpring, animated } from '@react-spring/web';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { notificationStore } from '@/rxjs/notificationStore';

const SubmissionCard: React.FC<{
  sub: SubmissionType;
  isFadingOut: boolean;
  isFadingIn: boolean;
  onAccept: () => Promise<void>;
  onReject: () => void;
  isProcessing?: boolean;
}> = ({
  sub,
  isFadingOut,
  isFadingIn,
  onAccept,
  onReject,
  isProcessing = false,
}) => {
  const fadeAnimation = useSpring({
    opacity: isFadingOut ? 0 : 1,
    transform: isFadingOut
      ? 'scale(0.95) translateX(20px)'
      : isFadingIn
        ? 'scale(1) translateX(0)'
        : 'scale(1) translateX(0)',
    from: isFadingIn
      ? { opacity: 0, transform: 'scale(0.95) translateX(-20px)' }
      : undefined,
    config: { duration: 300 },
  });

  const buttonsFadeAnimation = useSpring({
    opacity: sub.status === 'accepted' ? 0 : 1,
    config: { duration: 300 },
  });

  return (
    <animated.div key={sub._id} style={fadeAnimation}>
      <div className="flex items-center justify-between bg-black backdrop-blur-sm border border-white-500 p-4 rounded-xl shadow-md hover:shadow-lg transition">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Image
              src={sub.influencer?.profileImage || '/images/image4.png'}
              alt={sub.influencer?.username || 'User'}
              width={24}
              height={24}
              className="rounded-full"
            />
            <p className="font-semibold text-white">
              {sub.influencer?.username || 'Anonymous Influencer'}
            </p>
          </div>
          <p className="text-sm text-purple-100 mb-2 line-clamp-3">
            {sub.content}
          </p>
          <p className="text-xs text-purple-300">
            {sub.submittedAt
              ? new Date(sub.submittedAt).toLocaleDateString()
              : 'No date'}
          </p>
        </div>

        <div className="mx-4 text-center">
          <p
            className={`text-sm font-bold ${
              sub.status === 'accepted'
                ? 'text-green-400'
                : sub.status === 'rejected'
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }`}
          >
            {sub.status ? sub.status.toUpperCase() : 'PENDING'}
          </p>
        </div>

        {sub.status === 'pending' && (
          <animated.div style={buttonsFadeAnimation} className="flex gap-3">
            <button
              onClick={onAccept}
              disabled={isProcessing}
              title="Accept submission"
              className={`text-green-400 hover:text-green-300 transition ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircleIcon className="w-6 h-6 fill-green-400 hover:fill-green-300" />
              )}
            </button>

            <button
              onClick={onReject}
              disabled={isProcessing}
              title="Reject submission"
              className={`p-1 rounded-full hover:bg-white/10 transition ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <XCircleIcon className="w-6 h-6" />
              )}
            </button>
          </animated.div>
        )}
      </div>
    </animated.div>
  );
};

const CampaignsContent: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [campaignSubmissions, setCampaignSubmissions] = useState<
    SubmissionType[]
  >([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    SubmissionType[]
  >([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string>('');
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<
    SubmissionType[]
  >([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<
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
  const [fadingOutSubmissions, setFadingOutSubmissions] = useState<Set<string>>(
    new Set(),
  );
  const [fadingInSubmissions, setFadingInSubmissions] = useState<Set<string>>(
    new Set(),
  );
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const prevAcceptedRef = useRef<SubmissionType[]>([]);
  const prevRejectedRef = useRef<SubmissionType[]>([]);
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState('');
  const [submissionPage, setSubmissionPage] = useState(1);
  const [processingSubmissions, setProcessingSubmissions] = useState<
    Set<string>
  >(new Set());
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<
    'all' | 'pending' | 'accepted' | 'rejected'
  >('all');
  const submissionsPerPage = 10;

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(
    '/images/screenshots/HandM.jpg',
  );
  const [userId, setUserId] = useState<string>('');

  const { showToast } = useToast();

  const stats = useMemo(() => {
    const allSubmissions = submissions$.getValue();
    let totalSubmissions = 0;
    let acceptedSubmissions = 0;
    let rejectedSubmissions = 0;

    Object.values(allSubmissions).forEach((subs) => {
      if (Array.isArray(subs)) {
        totalSubmissions += subs.length;
        acceptedSubmissions += subs.filter((s) => s.status === 'accepted').length;
        rejectedSubmissions += subs.filter((s) => s.status === 'rejected').length;
      }
    });

    return {
      submissions: totalSubmissions,
      accepted: acceptedSubmissions,
      rejected: rejectedSubmissions,
      posts: totalSubmissions,
      likes: acceptedSubmissions * 10,
      shares: Math.floor(acceptedSubmissions * 2.5),
    };
  }, [campaigns]);

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
      setUserId(state.id || localStorage.getItem('userId') || '');
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
        const allCampaignSubs = allSubs[selectedCampaign.id] || [];
        const pendingSubs = allCampaignSubs.filter(
          (sub) => sub.status === 'pending' || !sub.status,
        );
        const acceptedSubs = allCampaignSubs.filter(
          (sub) => sub.status === 'accepted',
        );
        const rejectedSubs = allCampaignSubs.filter(
          (sub) => sub.status === 'rejected',
        );

        const newAccepted = acceptedSubs.filter(
          (sub) =>
            !prevAcceptedRef.current.some((prev) => prev._id === sub._id),
        );
        const newRejected = rejectedSubs.filter(
          (sub) =>
            !prevRejectedRef.current.some((prev) => prev._id === sub._id),
        );

        setCampaignSubmissions(pendingSubs);
        setAcceptedSubmissions(acceptedSubs);
        setRejectedSubmissions(rejectedSubs);

        if (newAccepted.length > 0 || newRejected.length > 0) {
          setFadingInSubmissions((prev) => {
            const updated = new Set(prev);
            newAccepted.forEach((sub) => updated.add(sub._id));
            newRejected.forEach((sub) => updated.add(sub._id));
            return updated;
          });

          setTimeout(() => {
            setFadingInSubmissions((prev) => {
              const updated = new Set(prev);
              newAccepted.forEach((sub) => updated.delete(sub._id));
              newRejected.forEach((sub) => updated.delete(sub._id));
              return updated;
            });
          }, 300);
        }

        prevAcceptedRef.current = acceptedSubs;
        prevRejectedRef.current = rejectedSubs;
      },
    );

    submissionStore.fetchSubmissions(selectedCampaign.id);

    return () => sub.unsubscribe();
  }, [selectedCampaign]);

  useEffect(() => {
    const subscription = submissions$.subscribe((allSubs) => {
      const subsForCampaign = allSubs[currentCampaignId] || [];
      setFilteredSubmissions(subsForCampaign);
    });

    return () => subscription.unsubscribe();
  }, [currentCampaignId]);

  useEffect(() => {
    const sub = notificationStore.brandNotifications$.subscribe((notifs) => {
      setNotifications(notifs);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    submissionStore.fetchSubmissions(currentCampaignId, submissionSearchQuery);
  }, [submissionSearchQuery, currentCampaignId]);

  async function handleProfileSave(
    newBio: string,
    newImage: File | string | null,
  ) {
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
  }

  const toggleExpand = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleViewSubmissions = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    setCurrentCampaignId(campaign.id);
    setShowSubmissions(true);
  };

  const handleCloseSubmissions = () => {
    setShowSubmissions(false);
    setSubmissionSearchQuery('');
    setSubmissionStatusFilter('all');
    setSubmissionPage(1);
  };

  const handleDeleteClick = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      await campaignStore.deleteCampaign(campaignToDelete);
      setCampaignToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

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

  const filteredPendingSubmissions = useMemo(() => {
    return campaignSubmissions.filter(
      (sub) =>
        (submissionStatusFilter === 'all' ||
          submissionStatusFilter === 'pending') &&
        (sub.content
          .toLowerCase()
          .includes(submissionSearchQuery.toLowerCase()) ||
          sub.influencer?.username
            .toLowerCase()
            .includes(submissionSearchQuery.toLowerCase())),
    );
  }, [campaignSubmissions, submissionSearchQuery, submissionStatusFilter]);

  const filteredAcceptedSubmissions = useMemo(() => {
    return acceptedSubmissions.filter(
      (sub) =>
        (submissionStatusFilter === 'all' ||
          submissionStatusFilter === 'accepted') &&
        (sub.content
          .toLowerCase()
          .includes(submissionSearchQuery.toLowerCase()) ||
          sub.influencer?.username
            .toLowerCase()
            .includes(submissionSearchQuery.toLowerCase())),
    );
  }, [acceptedSubmissions, submissionSearchQuery, submissionStatusFilter]);

  const filteredRejectedSubmissions = useMemo(() => {
    return rejectedSubmissions.filter(
      (sub) =>
        (submissionStatusFilter === 'all' ||
          submissionStatusFilter === 'rejected') &&
        (sub.content
          .toLowerCase()
          .includes(submissionSearchQuery.toLowerCase()) ||
          sub.influencer?.username
            .toLowerCase()
            .includes(submissionSearchQuery.toLowerCase())),
    );
  }, [rejectedSubmissions, submissionSearchQuery, submissionStatusFilter]);

  const paginatedPendingSubmissions = useMemo(() => {
    const start = (submissionPage - 1) * submissionsPerPage;
    return filteredPendingSubmissions.slice(start, start + submissionsPerPage);
  }, [filteredPendingSubmissions, submissionPage]);

  const paginatedAcceptedSubmissions = useMemo(() => {
    const start = (submissionPage - 1) * submissionsPerPage;
    return filteredAcceptedSubmissions.slice(start, start + submissionsPerPage);
  }, [filteredAcceptedSubmissions, submissionPage]);

  const paginatedRejectedSubmissions = useMemo(() => {
    const start = (submissionPage - 1) * submissionsPerPage;
    return filteredRejectedSubmissions.slice(start, start + submissionsPerPage);
  }, [filteredRejectedSubmissions, submissionPage]);

  const totalSubmissionPages = Math.ceil(
    Math.max(
      submissionStatusFilter === 'all' || submissionStatusFilter === 'pending'
        ? filteredPendingSubmissions.length
        : 0,
      submissionStatusFilter === 'all' || submissionStatusFilter === 'accepted'
        ? filteredAcceptedSubmissions.length
        : 0,
      submissionStatusFilter === 'all' || submissionStatusFilter === 'rejected'
        ? filteredRejectedSubmissions.length
        : 0,
    ) / submissionsPerPage,
  );

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
              likes={stats.likes}
              shares={stats.shares}
              campaigns={campaigns.length}
              posts={stats.posts}
              submissions={stats.submissions}
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
                        onClick={() => handleDeleteClick(campaign.id)}
                        className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(campaign)}
                        className="relative flex items-center gap-1 bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700"
                      >
                        <Eye size={14} /> View
                        {notifications.filter(
                          (n) =>
                            n.campaignId === campaign.id &&
                            n.type === 'new_submission',
                        ).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                            {notifications.filter(
                              (n) =>
                                n.campaignId === campaign.id &&
                                n.type === 'new_submission',
                            ).length}
                          </span>
                        )}
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

        <NotificationWidget notifications={notifications} showToast={showToast} />
      </div>

      <animated.div
        style={slideIn}
        className="fixed inset-0 z-50 flex justify-end bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 bg-opacity-80"
      >
        <div className="flex flex-col md:flex-row w-full h-full overflow-hidden rounded-l-2xl shadow-2xl">
          <div className="flex-1 bg-gradient-to-b from-black-700 via-pink-600 to-pink-800 text-white p-4 sm:p-6 overflow-y-auto">
            <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold flex-1">
                Influencer Submissions
              </h2>
              <button
                onClick={handleCloseSubmissions}
                className="bg-red-500 text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base hover:bg-red-600 transition flex-shrink-0"
              >
                Close
              </button>
            </div>

            {selectedCampaign && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 truncate">
                  {selectedCampaign.title}
                </h3>

                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    value={submissionSearchQuery}
                    onChange={(e) => {
                      setSubmissionSearchQuery(e.target.value);
                      setSubmissionPage(1);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-600 text-gray-800 bg-gray-100 rounded-lg sm:rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="relative w-full">
                    <select
                      value={submissionStatusFilter}
                      onChange={(e) => {
                        setSubmissionStatusFilter(
                          e.target.value as
                            | 'all'
                            | 'pending'
                            | 'accepted'
                            | 'rejected',
                        );
                        setSubmissionPage(1);
                      }}
                      className="w-full appearance-none px-3 sm:px-4 py-2 text-sm border border-gray-600 text-gray-800 bg-gray-100 rounded-lg sm:rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending Only</option>
                      <option value="accepted">Accepted Only</option>
                      <option value="rejected">Rejected Only</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                {(submissionStatusFilter === 'all' ||
                  submissionStatusFilter === 'pending') && (
                  <>
                    <h4 className="text-sm sm:text-lg font-semibold mb-3">
                      Pending ({filteredPendingSubmissions.length})
                    </h4>

                    {paginatedPendingSubmissions.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {paginatedPendingSubmissions.map((sub) => {
                          const isFadingOut = fadingOutSubmissions.has(sub._id);

                          const handleAccept = async () => {
                            setFadingOutSubmissions((prev) => {
                              const updated = new Set(prev);
                              updated.add(sub._id);
                              return updated;
                            });

                            setTimeout(async () => {
                              setProcessingSubmissions((prev) =>
                                new Set(prev).add(sub._id),
                              );
                              try {
                                const updated =
                                  await submissionStore.acceptSubmission(
                                    selectedCampaign!.id,
                                    sub._id,
                                  );

                                if (updated) {
                                  setFadingOutSubmissions((prev) => {
                                    const updated = new Set(prev);
                                    updated.delete(sub._id);
                                    return updated;
                                  });
                                  showToast('Submission accepted!', 'success');
                                } else {
                                  setFadingOutSubmissions((prev) => {
                                    const updated = new Set(prev);
                                    updated.delete(sub._id);
                                    return updated;
                                  });
                                  showToast(
                                    'Failed to accept submission. Please try again.',
                                    'error',
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  'Error accepting submission:',
                                  error,
                                );
                                setFadingOutSubmissions((prev) => {
                                  const updated = new Set(prev);
                                  updated.delete(sub._id);
                                  return updated;
                                });
                                showToast(
                                  'Failed to accept submission. Please try again.',
                                  'error',
                                );
                              } finally {
                                setProcessingSubmissions((prev) => {
                                  const updated = new Set(prev);
                                  updated.delete(sub._id);
                                  return updated;
                                });
                              }
                            }, 300);
                          };

                          const handleReject = () => {
                            setFadingOutSubmissions((prev) => {
                              const updated = new Set(prev);
                              updated.add(sub._id);
                              return updated;
                            });

                            setTimeout(async () => {
                              setProcessingSubmissions((prev) =>
                                new Set(prev).add(sub._id),
                              );
                              try {
                                const updated =
                                  await submissionStore.rejectSubmission(
                                    selectedCampaign!.id,
                                    sub._id,
                                  );

                                if (updated) {
                                  setFadingOutSubmissions((prev) => {
                                    const updated = new Set(prev);
                                    updated.delete(sub._id);
                                    return updated;
                                  });
                                  showToast('Submission rejected!', 'error');
                                } else {
                                  setFadingOutSubmissions((prev) => {
                                    const updated = new Set(prev);
                                    updated.delete(sub._id);
                                    return updated;
                                  });
                                  showToast(
                                    'Failed to reject submission. Please try again.',
                                    'error',
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  'Error rejecting submission:',
                                  error,
                                );
                                setFadingOutSubmissions((prev) => {
                                  const updated = new Set(prev);
                                  updated.delete(sub._id);
                                  return updated;
                                });
                                showToast(
                                  'Failed to reject submission. Please try again.',
                                  'error',
                                );
                              } finally {
                                setProcessingSubmissions((prev) => {
                                  const updated = new Set(prev);
                                  updated.delete(sub._id);
                                  return updated;
                                });
                              }
                            }, 300);
                          };

                          return (
                            <SubmissionCard
                              key={sub._id}
                              sub={sub}
                              isFadingOut={isFadingOut}
                              onAccept={handleAccept}
                              onReject={handleReject}
                              isProcessing={processingSubmissions.has(sub._id)}
                              isFadingIn={false}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-purple-200 italic mb-6">
                        No pending submissions.
                      </p>
                    )}
                  </>
                )}

                {(submissionStatusFilter === 'all' ||
                  submissionStatusFilter === 'accepted') && (
                  <>
                    <h4 className="text-sm sm:text-lg font-semibold mb-3">
                      Accepted ({filteredAcceptedSubmissions.length})
                    </h4>

                    {paginatedAcceptedSubmissions.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {paginatedAcceptedSubmissions.map((sub) => {
                          return (
                            <SubmissionCard
                              key={sub._id}
                              sub={{ ...sub, status: 'accepted' }}
                              isFadingOut={false}
                              isFadingIn={fadingInSubmissions.has(sub._id)}
                              onAccept={async () => {}}
                              onReject={() => {}}
                              isProcessing={false}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-purple-200 italic mb-6">
                        No accepted submissions yet.
                      </p>
                    )}
                  </>
                )}

                {(submissionStatusFilter === 'all' ||
                  submissionStatusFilter === 'rejected') && (
                  <>
                    <h4 className="text-sm sm:text-lg font-semibold mb-3">
                      Rejected ({filteredRejectedSubmissions.length})
                    </h4>

                    {paginatedRejectedSubmissions.length > 0 ? (
                      <div className="space-y-4">
                        {paginatedRejectedSubmissions.map((sub) => {
                          return (
                            <SubmissionCard
                              key={sub._id}
                              sub={{ ...sub, status: 'rejected' }}
                              isFadingOut={false}
                              isFadingIn={fadingInSubmissions.has(sub._id)}
                              onAccept={async () => {}}
                              onReject={() => {}}
                              isProcessing={false}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-purple-200 italic">
                        No rejected submissions yet.
                      </p>
                    )}
                  </>
                )}

                {totalSubmissionPages > 1 && (
                  <div className="flex justify-center mt-4 sm:mt-6 space-x-2 sm:space-x-4 items-center flex-wrap">
                    <button
                      onClick={() =>
                        setSubmissionPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={submissionPage === 1}
                      className="px-2 sm:px-4 py-1 sm:py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      Prev
                    </button>
                    <span className="font-semibold text-white text-xs sm:text-base">
                      <span className="hidden sm:inline">Page </span>
                      {submissionPage}
                      <span className="hidden sm:inline">
                        /{totalSubmissionPages}
                      </span>
                      <span className="inline sm:hidden">
                        /{totalSubmissionPages}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        setSubmissionPage((prev) =>
                          Math.min(prev + 1, totalSubmissionPages),
                        )
                      }
                      disabled={submissionPage === totalSubmissionPages}
                      className="px-2 sm:px-4 py-1 sm:py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 p-4 sm:p-6 border-t md:border-t-0 md:border-l border-gray-300 md:border-gray-200 flex flex-col justify-between">
            {selectedCampaign && (
              <>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                    Overview
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                    <p>
                      <strong>Total Submissions:</strong>{' '}
                      {campaignSubmissions.length +
                        acceptedSubmissions.length +
                        rejectedSubmissions.length}
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

                <div className="mt-4 sm:mt-6 bg-white/60 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-inner">
                  <h5 className="font-semibold text-sm sm:text-base text-gray-800 mb-2">
                    Quick Stats
                  </h5>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                    <span>Accepted:</span>
                    <span className="font-medium text-green-600">
                      {acceptedSubmissions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
                    <span>Rejected:</span>
                    <span className="font-medium text-red-600">
                      {rejectedSubmissions.length}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </animated.div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Delete Campaign</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsContent;
