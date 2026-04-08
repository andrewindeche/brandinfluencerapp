import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pencil, Trash2, X } from 'lucide-react';
import TipBox from './TipBox';
import SubmissionModal from './SubmissionModal';
import { CampaignType } from '../../types';
import { CampaignsSectionProps } from '../../interfaces';
import { campaignStore } from '@/rxjs/campaignStore';
import Toast from './Toast';
import { submissionStore, submissions$ } from '@/rxjs/submissionStore';
import { SubmissionType } from '@/interfaces';

const CampaignsSection: React.FC<CampaignsSectionProps> = ({
  campaigns,
  expanded,
  onExpandToggle,
  maxCharCount = 70,
  notificationOpen,
  joined,
  tips = "💡 Click 'Submit' to send your entry or tap on a campaign card to expand.",
  matchedBrands = [],
  userBio = '',
  acceptedBrands = new Set(),
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive' | 'joined'
  >('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>(
    'success',
  );
  const [campaignSubmissions, setCampaignSubmissions] = useState<Record<string, SubmissionType[]>>({});
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionType | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deletingSubmission, setDeletingSubmission] = useState<SubmissionType | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<SubmissionType | null>(null);
  const [joiningCampaign, setJoiningCampaign] = useState<string | null>(null);
  const [joinedCampaigns, setJoinedCampaigns] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('joinedCampaigns');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('joinedCampaigns', JSON.stringify([...joinedCampaigns]));
  }, [joinedCampaigns]);

  useEffect(() => {
    campaigns.forEach(async (campaign) => {
      if (campaign.joined) {
        const subs = await campaignStore.fetchSubmissions(campaign.id);
        if (subs) {
          setCampaignSubmissions(prev => ({ ...prev, [campaign.id]: subs }));
        }
      }
    });
  }, [campaigns]);

  useEffect(() => {
    const subscription = submissions$.subscribe((allSubs) => {
      if (selectedCampaign) {
        const subsForCampaign = allSubs[selectedCampaign.id] || [];
        setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subsForCampaign }));
      }
    });
    return () => subscription.unsubscribe();
  }, [selectedCampaign]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
  ) => {
    setToastMessage(message);
    setToastType(type);
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const handleCardClick = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    setViewingSubmission(null);
    setModalOpen(true);
  };

  const handleSubmit = async (text: string) => {
    if (!selectedCampaign) return;

    if (selectedCampaign.status === 'inactive') {
      showToast('Cannot submit to an inactive campaign.', 'error');
      return;
    }

    const newSubmission = await submissionStore.addSubmission(
      selectedCampaign.id,
      text,
    );

    if (newSubmission) {
      showToast('Submission sent successfully ✅', 'success');
      const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
      if (subs) {
        setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
      }
    } else {
      showToast(
        'Failed to submit. Make sure you joined the campaign first!',
        'error',
      );
    }
  };

  const handleJoinCampaign = async (campaign: CampaignType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (joinedCampaigns.has(campaign.id) || campaign.joined) {
      handleCardClick(campaign);
      return;
    }

    setJoiningCampaign(campaign.id);
    try {
      await campaignStore.joinCampaign(campaign.id);
      setJoinedCampaigns(prev => new Set([...prev, campaign.id]));
      showToast('You joined the campaign!', 'success');
      handleCardClick(campaign);
    } catch (err) {
      showToast('Failed to join campaign', 'error');
    } finally {
      setJoiningCampaign(null);
    }
  };

  const handleEditClick = (sub: SubmissionType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubmission(sub);
    setEditContent(sub.content || '');
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingSubmission || !selectedCampaign) return;
    try {
      await campaignStore.updateSubmission(selectedCampaign.id, editingSubmission._id, editContent);
      showToast('Submission updated successfully', 'success');
      setEditModalOpen(false);
      const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
      if (subs) {
        setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
      }
    } catch (err) {
      showToast('Failed to update submission', 'error');
    }
  };

  const handleDeleteClick = (sub: SubmissionType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSubmission(sub);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubmission || !selectedCampaign) return;
    try {
      await campaignStore.deleteSubmission(selectedCampaign.id, deletingSubmission._id);
      showToast('Submission deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
      if (subs) {
        setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
      }
    } catch (err) {
      showToast('Failed to delete submission', 'error');
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.instructions.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'joined'
          ? campaign.joined
          : campaign.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const activeNotJoinedCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => 
      campaign.status === 'active' && !campaign.joined
    );
  }, [campaigns]);

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize);

  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, currentPage]);

  const goToPrevPage = () =>
    setCurrentPage((prev: number) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev: number) => Math.min(prev + 1, totalPages));

  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white">
      <h4 className="text-xl font-bold text-center text-black mb-4">
        Campaigns
      </h4>

      <TipBox
        tip={tips}
        duration={10000}
        instructions={
          matchedBrands.length === 0 ? (
            <div>
              <p className="font-semibold mb-1">Get started:</p>
              <p>Update your bio, interests, and category in your profile to match with brands and view campaign details.</p>
            </div>
          ) : undefined
        }
      />

      {activeNotJoinedCampaigns.length > 0 && (
        <div className="mb-4 font-medium text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
          You have {activeNotJoinedCampaigns.length} open campaign{activeNotJoinedCampaigns.length > 1 ? 's' : ''} awaiting submission!
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search campaigns..."
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="relative w-full sm:w-[200px]">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value as 'all' | 'active' | 'inactive' | 'joined',
              );
              setCurrentPage(1);
            }}
            className="w-full appearance-none px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="joined">Joined</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          notificationOpen
            ? 'flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-blue-500 snap-x snap-mandatory'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }`}
      >
        <AnimatePresence>
          {paginatedCampaigns.map((campaign) => {
            const campaignBrandId = typeof campaign.brand === 'string' ? campaign.brand : campaign.brand?._id;
            const matchedBrand = matchedBrands.find(mb => mb.id === campaignBrandId);
            const isMatched = !!matchedBrand;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={campaign.id}
                className={`relative ${
                  notificationOpen ? 'min-w-[32%] max-w-[32%] snap-start' : ''
                } flex-shrink-0 bg-black text-white p-1 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 active:scale-100 hover:ring-2 hover:ring-blue-300 cursor-pointer`}
                onClick={() => handleCardClick(campaign)}
              >
                <Image
                  src={campaign.images?.[0] || '/images/fit.jpg'}
                  alt={campaign.title}
                  width={500}
                  height={300}
                  className="rounded-2xl w-full h-[150px] object-cover"
                />
                <SubmissionModal
                  isOpen={modalOpen}
                  onClose={() => { setModalOpen(false); setViewingSubmission(null); }}
                  campaignTitle={selectedCampaign?.title ?? ''}
                  imageSrc={selectedCampaign?.images?.[0] || '/images/fit.jpg'}
                  message={selectedCampaign?.instructions || ''}
                  onSubmit={handleSubmit}
                  joined={selectedCampaign ? (joinedCampaigns.has(selectedCampaign.id) || selectedCampaign.joined) : false}
                  status={selectedCampaign?.status ?? 'inactive'}
                  showForm={selectedCampaign ? (acceptedBrands.has(campaignBrandId) && (joinedCampaigns.has(selectedCampaign.id) || selectedCampaign.joined)) : false}
                  startDate={selectedCampaign?.startDate}
                  endDate={selectedCampaign?.endDate}
                  campaignSubmissions={selectedCampaign ? campaignSubmissions[selectedCampaign.id] : undefined}
                  onSelectSubmission={(sub) => setViewingSubmission(sub)}
                  viewingSubmission={viewingSubmission}
                  onUpdateSubmission={viewingSubmission ? async (id, content) => {
                    if (!selectedCampaign) return;
                    await campaignStore.updateSubmission(selectedCampaign.id, id, content);
                    const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
                    if (subs) {
                      setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
                    }
                  } : undefined}
                  onDeleteSubmission={viewingSubmission ? async (id) => {
                    if (!selectedCampaign) return;
                    await campaignStore.deleteSubmission(selectedCampaign.id, id);
                    const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
                    if (subs) {
                      setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
                    }
                  } : undefined}
                  onAcceptSubmission={viewingSubmission ? async (id) => {
                    if (!selectedCampaign) return;
                    await submissionStore.acceptSubmission(selectedCampaign.id, id);
                    const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
                    if (subs) {
                      setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
                    }
                  } : undefined}
                  onRejectSubmission={viewingSubmission ? async (id) => {
                    if (!selectedCampaign) return;
                    await submissionStore.rejectSubmission(selectedCampaign.id, id);
                    const subs = await campaignStore.fetchSubmissions(selectedCampaign.id);
                    if (subs) {
                      setCampaignSubmissions(prev => ({ ...prev, [selectedCampaign.id]: subs }));
                    }
                  } : undefined}
                  isBrand={true}
                />
                <div className="bg-[#005B96] text-white p-2 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-xs">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-semibold">
                      Ends: {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        campaign.status === 'active'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {campaign.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {campaign.status === 'active' && !isMatched && !acceptedBrands.has(campaignBrandId) && (
                    <button
                      onClick={(e) => handleJoinCampaign(campaign, e)}
                      disabled={joiningCampaign === campaign.id}
                      className="mt-2 px-3 py-1 text-sm bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition w-full disabled:opacity-50"
                    >
                      {joiningCampaign === campaign.id 
                        ? 'Joining...' 
                        : (joinedCampaigns.has(campaign.id) || campaign.joined)
                          ? 'View'
                          : 'Join'}
                    </button>
                  )}
                  {acceptedBrands.has(campaignBrandId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!joinedCampaigns.has(campaign.id) && !campaign.joined) {
                          setJoinedCampaigns(prev => new Set([...prev, campaign.id]));
                        }
                      }}
                      className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full transition w-full ${
                        joinedCampaigns.has(campaign.id) || campaign.joined
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {joinedCampaigns.has(campaign.id) || campaign.joined ? 'Joined' : 'Join Campaigns'}
                    </button>
                  )}
                  {isMatched && !acceptedBrands.has(campaignBrandId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(campaign);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition w-full"
                    >
                      View
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6 space-x-4 items-center">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-semibold text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Edit Submission</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && deletingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Delete Submission?</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this submission? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default CampaignsSection;
