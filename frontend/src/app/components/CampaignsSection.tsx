import React from 'react';
import Image from 'next/image';

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
    <>
      <h4 className="text-xl font-bold text-center text-black mb-4">
        Campaigns
      </h4>
      <div
        className={`transition-all duration-300 ${
          notificationOpen
            ? 'flex overflow-x-auto space-x-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }`}
      >
        {campaigns.map((title, index) => {
          const isExpanded = expanded[title];
          const displayedText = isExpanded
            ? message
            : `${message.slice(0, maxCharCount)}${message.length > maxCharCount ? '...' : ''}`;

          return (
            <div
              key={index}
              className={`relative bg-black text-white p-1 rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:ring-2 hover:ring-blue-300 ${
                notificationOpen ? 'flex-shrink-0 w-[300px]' : ''
              }`}
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
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CampaignsSection;
