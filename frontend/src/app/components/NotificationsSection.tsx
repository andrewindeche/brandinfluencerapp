import React, { useState } from 'react';
import NotificationCard from './NotificationCard';
import { Notification, NotificationsSectionProps } from '../../interfaces';

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  show,
  toggleShow,
  message,
}) => {
  const notificationCount = notifications.length;
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="p-4 rounded-2xl shadow-lg bg-white relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-bold text-black">Notifications</h4>
          {notificationCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notificationCount}
            </span>
          )}
        </div>
        <button
          onClick={toggleShow}
          className="text-sm text-blue-600 hover:underline"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      {show ? (
        <div className="space-y-4 transition-all duration-300">
          {notifications.length === 0 ? (
            <div className="flex justify-center items-center py-6">
              <p className="text-sm text-gray-500">No Notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                imageSrc="/images/fit.jpg"
                campaignName={n.campaignTitle}
                status={n.type}
                date={new Date(n.date).toLocaleDateString()}
                message={n.message}
                expanded={expandedCards.has(n.id)}
                onToggleExpand={() => toggleExpand(n.id)}
              />
            ))
          )}
        </div>
      ) : notificationCount > 0 ? (
        <div
          className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce cursor-pointer"
          onClick={toggleShow}
          title="Show Notifications"
        >
          🔔 {notificationCount}
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsSection;
