import React, { useState } from 'react';
import { Notification, NotificationsSectionProps } from '../../interfaces';
import { Bell, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { notificationStore } from '@/rxjs/notificationStore';

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

  const handleCollapseAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleShow();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-lg">✓</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-lg">✕</span>
          </div>
        );
      case 'new_submission':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-gray-600" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
      case 'new_submission':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">New</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Update</span>;
    }
  };

  return (
    <div className="rounded-2xl shadow-lg bg-white relative overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleShow}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                {notificationCount}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">Notifications</h4>
            <p className="text-xs text-gray-500">
              {notificationCount > 0 
                ? `${notificationCount} unread notification${notificationCount > 1 ? 's' : ''}`
                : 'No notifications'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notificationCount > 0 && show && (
            <>
              <button
                onClick={handleCollapseAll}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Collapse all
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notificationStore.clearNotifications();
                }}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            </>
          )}
          <div className={`transform transition-transform ${show ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {show && (
        <div className="border-t border-gray-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">You'll see updates when brands respond to your submissions</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(n.id)}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {n.campaignTitle || 'Campaign'}
                        </p>
                        {getStatusBadge(n.type)}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {n.date ? new Date(n.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}
                      </p>
                    </div>
                    {(n.type === 'accepted' || n.type === 'rejected') && (
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedCards.has(n.id) ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  
                  {expandedCards.has(n.id) && (
                    <div className="mt-3 ml-11 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        {n.type === 'accepted' 
                          ? 'Great news! Your submission was accepted by the brand. They may contact you for next steps.'
                          : n.type === 'rejected'
                            ? 'Unfortunately, your submission was not accepted this time. Keep trying with other campaigns!'
                            : 'A brand has submitted new content for your campaign.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!show && notificationCount > 0 && (
        <div
          className="absolute top-4 right-4 cursor-pointer"
          onClick={toggleShow}
        >
          <span className="sr-only">Show Notifications</span>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
