import React from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { NotificationType } from '@/interfaces';

interface BrandInvitationModalProps {
  notification: NotificationType | null;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

const BrandInvitationModal: React.FC<BrandInvitationModalProps> = ({
  notification,
  onAccept,
  onReject,
  isProcessing,
}) => {
  if (!notification) return null;

  const brandName = notification.brandName || 'a brand';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Brand Invitation</h3>
            <button
              onClick={onReject}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{brandName}</p>
              <p className="text-xs text-gray-500">wants to connect with you</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You've been accepted! You can now join their campaigns and make submissions.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4" />
                Not Now
              </span>
            </button>
            <button
              onClick={onAccept}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-1">
                {isProcessing ? (
                  'Joining...'
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Join Campaigns
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandInvitationModal;