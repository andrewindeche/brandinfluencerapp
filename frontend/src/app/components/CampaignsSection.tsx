import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import TipBox from './TipBox';
import SubmissionModal from './SubmissionModal';
import { CampaignType } from '@/rxjs/campaignStore';

interface Props {
  campaigns: CampaignType[];
  expanded: { [key: string]: boolean };
  onExpandToggle: (title: string) => void;
  onCampaignAction: (title: string) => void;
  maxCharCount?: number;
  notificationOpen: boolean;
}

const CampaignsSection: React.FC<Props> = ({
  campaigns,
  expanded,
  onExpandToggle,
  onCampaignAction,
  maxCharCount = 70,
  notificationOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const handleCardClick = (campaign: CampaignType) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const handleSubmit = (text: string) => {
    if (selectedCampaign) {
      onCampaignAction(selectedCampaign.title);
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.instructions.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

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
        tip="💡 Click 'Submit' to send your entry or tap on a campaign card to expand."
        duration={10000}
      />

      {filteredCampaigns.length > 0 && (
        <div className="mb-4 font-medium text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
          You have open campaigns awaiting submission!
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
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
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

      <div
        className={`transition-all duration-500 ease-in-out ${
          notificationOpen
            ? 'flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-blue-500 snap-x snap-mandatory'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }`}
      >
        <AnimatePresence>
          {paginatedCampaigns.map((campaign) => {
            const isExpanded = expanded[campaign.title];
            const displayedText = isExpanded
              ? campaign.instructions
              : `${campaign.instructions.slice(0, maxCharCount)}${
                  campaign.instructions.length > maxCharCount ? '...' : ''
                }`;

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
                  onClose={() => setModalOpen(false)}
                  campaignTitle={selectedCampaign?.title ?? ''}
                  imageSrc={selectedCampaign?.images?.[0] || '/images/fit.jpg'}
                  message={selectedCampaign?.instructions || ''}
                  onSubmit={handleSubmit}
                />
                <div className="bg-[#005B96] text-white p-2 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-xs">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs mt-2">{displayedText}</p>
                  {campaign.instructions.length > maxCharCount && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandToggle(campaign.title);
                      }}
                      className="text-red-400 hover:underline text-xs mt-1"
                    >
                      {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(campaign);
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition"
                  >
                    Submit
                  </button>
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
    </div>
  );
};

export default CampaignsSection;
