import React from 'react';
import Image from 'next/image';

interface NotificationCardProps {
  imageSrc: string;
  campaignName: string;
  status: 'accepted' | 'rejected';
  date: string;
  message: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  imageSrc,
  campaignName,
  status,
  date,
  message,
}) => {
  const isAccepted = status === 'accepted';

  return (
    <div
      className={`p-4 rounded-xl shadow-lg flex items-start space-x-4 text-sm ${
        isAccepted ? 'bg-white' : 'bg-gray-200'
      }`}
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
          <p
            className={`font-semibold ${isAccepted ? 'text-green-500' : 'text-red-500'}`}
          >
            {isAccepted ? 'Submission Accepted' : 'Submission Rejected'}
          </p>
          <p className="text-gray-500">{date}</p>
        </div>
        <p className="text-gray-700 text-[12px]">{message}</p>
      </div>
    </div>
  );
};

export default NotificationCard;
