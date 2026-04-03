import React, { useState } from 'react';
import NotificationCard from './NotificationCard';
import { NotificationWidgetProps } from '../../interfaces';
import { notificationStore } from '@/rxjs/notificationStore';
import { submissionStore } from '@/rxjs/submissionStore';
import { ToastProps } from '@/interfaces';

const NotificationWidget: React.FC<NotificationWidgetProps & { showToast?: (message: string, type: ToastProps['type']) => void }> = ({
  notifications,
  showToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleClear = () => {
    notificationStore.clearNotifications();
  };

  const handleAccept = async (notification: typeof notifications[0]) => {
    if (!notification.campaignId || !notification.submissionId) return;

    setProcessingIds((prev) => new Set(prev).add(notification.submissionId));

    try {
      const updated = await submissionStore.acceptSubmission(
        notification.campaignId,
        notification.submissionId,
      );

      if (updated) {
        showToast?.('Submission accepted!', 'success');
        notificationStore.removeNotification(notification.id);
      } else {
        showToast?.('Failed to accept submission', 'error');
      }
    } catch (error) {
      console.error('Error accepting submission:', error);
      showToast?.('Failed to accept submission', 'error');
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(notification.submissionId);
        return updated;
      });
    }
  };

  const handleReject = async (notification: typeof notifications[0]) => {
    if (!notification.campaignId || !notification.submissionId) return;

    setProcessingIds((prev) => new Set(prev).add(notification.submissionId));

    try {
      const updated = await submissionStore.rejectSubmission(
        notification.campaignId,
        notification.submissionId,
      );

      if (updated) {
        showToast?.('Submission rejected', 'success');
        notificationStore.removeNotification(notification.id);
      } else {
        showToast?.('Failed to reject submission', 'error');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      showToast?.('Failed to reject submission', 'error');
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(notification.submissionId);
        return updated;
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold p-3 rounded-full shadow-lg focus:outline-none transition-all hover:scale-105"
        title="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 w-96 max-h-[28rem] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-bold text-gray-800">
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({notifications.length})
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  imageSrc=""
                  campaignName={n.campaignTitle || 'Campaign'}
                  status={
                    n.type === 'new_submission'
                      ? 'new_submission'
                      : (n.type as 'accepted' | 'rejected')
                  }
                  date={n.date ? String(n.date) : n.timestamp}
                  message={n.message}
                  influencerName={(n as any).influencerName}
                  submissionContent={(n as any).content}
                  onAccept={n.type === 'new_submission' ? () => handleAccept(n) : undefined}
                  onReject={n.type === 'new_submission' ? () => handleReject(n) : undefined}
                  isProcessing={processingIds.has(n.submissionId)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationWidget;
