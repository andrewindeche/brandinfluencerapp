import React from 'react';
import { NotificationCardProps, NotificationType } from '../../interfaces';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NotificationCard: React.FC<
  NotificationCardProps & {
    onAccept?: () => void;
    onReject?: () => void;
    isProcessing?: boolean;
  }
> = ({
  campaignName,
  status,
  date,
  message,
  influencerName,
  submissionContent,
  expanded,
  onToggleExpand,
  onAccept,
  onReject,
  isProcessing,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'accepted':
        return {
          text: 'Accepted',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badgeBg: 'bg-green-100 text-green-700',
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badgeBg: 'bg-red-100 text-red-700',
        };
      case 'new_submission':
        return {
          text: 'New',
          color: 'text-blue-600',
          bg: 'bg-white',
          border: 'border-gray-200',
          badgeBg: 'bg-blue-100 text-blue-700',
        };
      default:
        return {
          text: 'Update',
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badgeBg: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const { text, color, bg, border, badgeBg } = getStatusStyles();
  const showActions = status === 'new_submission' && (onAccept || onReject);
  const isExpandable = status === 'accepted' || status === 'rejected';

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`p-4 rounded-xl border ${border} ${bg} shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{campaignName}</p>
          {influencerName && (
            <p className="text-xs text-gray-500 mt-0.5">
              From: {influencerName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}>
            {text}
          </span>
          {isExpandable && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-2 mb-2">
          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
            {message}
          </p>
        </div>
      )}

      {!expanded && (
        <p className="text-xs text-gray-500 mb-3 truncate">{message}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{formattedDate}</span>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
