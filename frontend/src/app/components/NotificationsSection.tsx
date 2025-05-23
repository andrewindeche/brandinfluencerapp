import React from 'react';
import NotificationCard from './NotificationCard';

interface Notification {
  id: number;
  campaign: string;
  status: 'accepted' | 'rejected';
}

interface Props {
  notifications: Notification[];
  show: boolean;
  toggleShow: () => void;
  message: string;
}

const NotificationsSection: React.FC<Props> = ({
  notifications,
  show,
  toggleShow,
  message,
}) => {
  const notificationCount = notifications.length;

  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white relative">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold text-black">Notifications</h4>
        <button
          onClick={toggleShow}
          className="text-sm text-blue-600 hover:underline"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      {show ? (
        <div className="space-y-4 transition-all duration-300">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              imageSrc="/images/fit.jpg"
              campaignName={n.campaign}
              status={n.status}
              date="16/01/2025"
              message={message}
            />
          ))}
        </div>
      ) : (
        <div
          className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce cursor-pointer"
          onClick={toggleShow}
          title="Show Notifications"
        >
          🔔 {notificationCount}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
