import React, { useState } from 'react';
import NotificationCard from './NotificationCard';

interface Notification {
  id: number;
  campaign: string;
  status: 'accepted' | 'rejected';
  date: string;
  message: string;
}

interface Props {
  notifications: Notification[];
}

const NotificationWidget: React.FC<Props> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-3 rounded-full shadow-lg focus:outline-none"
        title="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce cursor-pointer">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 w-80 max-h-96 bg-white border border-gray-300 rounded-2xl shadow-xl overflow-y-auto p-4 space-y-3">
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Notifications
          </h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                imageSrc="/images/fit.jpg"
                campaignName={n.campaign}
                status={n.status}
                date={n.date}
                message={n.message}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationWidget;
