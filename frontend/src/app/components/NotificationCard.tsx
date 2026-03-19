import React from 'react';
import Image from 'next/image';
import { NotificationCardProps } from '../../interfaces';

const NotificationCard: React.FC<NotificationCardProps> = ({
  imageSrc,
  campaignName,
  status,
  date,
  message,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'accepted':
        return {
          text: 'Submission Accepted',
          color: 'text-green-500',
          bg: 'bg-white',
        };
      case 'rejected':
        return {
          text: 'Submission Rejected',
          color: 'text-red-500',
          bg: 'bg-gray-200',
        };
      case 'new_submission':
        return {
          text: 'New Submission',
          color: 'text-blue-500',
          bg: 'bg-blue-50',
        };
      default:
        return {
          text: 'Update',
          color: 'text-gray-500',
          bg: 'bg-gray-100',
        };
    }
  };

  const { text, color, bg } = getStatusStyles();

  return (
    <div
      className={`p-4 rounded-xl shadow-lg flex items-start space-x-4 text-sm ${bg}`}
    >
      <Image
        src={imageSrc}
        alt={campaignName}
        width={150}
        height={200}
        className="w-16 h-16 rounded-lg"
      />

      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-blue-500">{campaignName}</p>

          <p className={`font-semibold ${color}`}>{text}</p>

          <p className="text-gray-500 text-xs">{date}</p>
        </div>

        <p className="text-gray-700 text-[12px]">{message}</p>
      </div>
    </div>
  );
};

export default NotificationCard;
