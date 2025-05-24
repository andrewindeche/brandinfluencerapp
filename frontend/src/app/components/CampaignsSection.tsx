import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
  onCampaignAction,
  maxCharCount = 70,
  notificationOpen,
}) => {
  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white">
      <h4 className="text-xl font-bold text-center text-black mb-4">
        Campaigns
      </h4>

      <div
        className={`transition-all duration-500 ease-in-out ${
          notificationOpen
            ? 'flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-blue-500 snap-x snap-mandatory'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }`}
      >
        <AnimatePresence>
          {campaigns.map((title, index) => {
            const isExpanded = expanded[title];
            const displayedText = isExpanded
              ? message
              : `${message.slice(0, maxCharCount)}${
                  message.length > maxCharCount ? '...' : ''
                }`;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={title}
                className={`${
                  notificationOpen ? 'min-w-[32%] max-w-[32%] snap-start' : ''
                } flex-shrink-0 bg-black text-white p-1 rounded-xl shadow-lg
                  transform transition-transform duration-300 ease-in-out
                  hover:scale-105 active:scale-100 hover:ring-2 hover:ring-blue-300 cursor-pointer`}
                onClick={() => onCampaignAction(title)}
              >
                <Image
                  src="/images/fit.jpg"
                  alt={title}
                  width={500}
                  height={300}
                  className="rounded-2xl w-full h-[150px] object-cover"
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
                      className={`text-xs font-bold ${
                        index % 2 === 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {index % 2 === 0 ? 'Active' : 'Inactive'}
                    </p>
                  </div>
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
