import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SubmissionModal from './SubmissionModal';

interface Props {
  campaigns: string[];
  message: string;
  expanded: { [key: string]: boolean };
  onExpandToggle: (title: string) => void;
  onCampaignAction: (title: string) => void;
  maxCharCount?: number;
  notificationOpen: boolean;
}

const CampaignsSection: React.FC<Props> = ({
  campaigns,
  message,
  expanded,
  onExpandToggle,
  maxCharCount = 70,
  notificationOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [submissionNoticeVisible, setSubmissionNoticeVisible] = useState(true);
  const [showTip, setShowTip] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowTip(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (title: string) => {
    setSelectedCampaign(title);
    setModalOpen(true);
  };

  const handleSubmit = (text: string) => {
    console.log(`Submission for ${selectedCampaign}:`, text);
    setSubmissionNoticeVisible(false);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((title, index) => {
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isActive = index % 2 === 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white">
      <h4 className="text-xl font-bold text-center text-black mb-4">
        Campaigns
      </h4>

      {submissionNoticeVisible && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-lg mb-4">
          You have open campaigns awaiting submission!
        </div>
      )}

      {showTip && (
        <div className="bg-blue-100 border border-blue-400 text-blue-800 p-3 rounded-lg mb-4 text-center select-none pointer-events-none">
          💡 Click &quot;Submit&quot; to send your entry or tap on a campaign
          card to expand.
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search campaigns..."
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-600 text-gray-800 bg-gray-100 rounded-xl shadow-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="relative w-full sm:w-[200px]">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
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

      <div
        className={`transition-all duration-500 ease-in-out ${
          notificationOpen
            ? 'flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-blue-500 snap-x snap-mandatory'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }`}
      >
        <AnimatePresence>
          {filteredCampaigns.map((title, index) => {
            const isExpanded = expanded[title];
            const displayedText = isExpanded
              ? message
              : `${message.slice(0, maxCharCount)}${message.length > maxCharCount ? '...' : ''}`;
            const isActive = index % 2 === 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={title}
                className={`relative ${notificationOpen ? 'min-w-[32%] max-w-[32%] snap-start' : ''} flex-shrink-0 bg-black text-white p-1 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 active:scale-100 hover:ring-2 hover:ring-blue-300 cursor-pointer`}
                onClick={() => handleCardClick(title)}
              >
                <Image
                  src="/images/fit.jpg"
                  alt={title}
                  width={500}
                  height={300}
                  className="rounded-2xl w-full h-[150px] object-cover"
                />
                <SubmissionModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  campaignTitle={selectedCampaign ?? ''}
                  imageSrc="/images/fit.jpg"
                  message={message}
                  onSubmit={handleSubmit}
                />
                <div className="bg-[#005B96] text-white p-2 rounded-b-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs">16/01/2025</p>
                  </div>
                  <p className="text-xs mt-2">{displayedText}</p>
                  {message.length > maxCharCount && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandToggle(title);
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
                      handleCardClick(title);
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
    </div>
  );
};

export default CampaignsSection;
