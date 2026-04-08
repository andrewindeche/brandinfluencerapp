import React, { useState, Fragment } from 'react';
import {
  Dialog,
  Description,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react';
import { X, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { TransitionChild } from '@headlessui/react';
import { SubmissionModalProps } from '../../interfaces';

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  campaignTitle,
  imageSrc,
  message,
  onSubmit,
  joined,
  status,
  campaignSubmissions,
  onSelectSubmission,
  viewingSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
  onAcceptSubmission,
  onRejectSubmission,
  isBrand,
}) => {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const handleSubmit = () => {
    if (text.trim() === '') return;
    onSubmit(text);
    setText('');
    setShowNewForm(false);
    onClose();
  };

  const handleUpdate = async () => {
    if (!viewingSubmission || !onUpdateSubmission || text.trim() === '') return;
    await onUpdateSubmission(viewingSubmission._id, text);
    setText('');
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!viewingSubmission || !onDeleteSubmission) return;
    await onDeleteSubmission(viewingSubmission._id);
    onClose();
  };

  const handleAccept = async () => {
    if (!viewingSubmission || !onAcceptSubmission) return;
    await onAcceptSubmission(viewingSubmission._id);
    onClose();
  };

  const handleReject = async () => {
    if (!viewingSubmission || !onRejectSubmission) return;
    await onRejectSubmission(viewingSubmission._id);
    onClose();
  };

  const handleBackToList = () => {
    if (onSelectSubmission) {
      onSelectSubmission(null as any);
    }
    setIsEditing(false);
    setShowNewForm(false);
    setText('');
  };

  const isViewing = viewingSubmission && !isEditing;
  const hasSubmissions = campaignSubmissions && campaignSubmissions.length > 0;
  const showSubmissionsList = hasSubmissions && !viewingSubmission && !showNewForm;

  const renderContent = () => {
    if (showSubmissionsList) {
      return (
        <div className="space-y-3">
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-3"
          >
            + Add New Submission
          </button>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {campaignSubmissions.map((sub) => (
              <div
                key={sub._id}
                onClick={() => onSelectSubmission?.(sub)}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    sub.status === 'accepted' ? 'bg-green-500' :
                    sub.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  } text-white`}>
                    {sub.status || 'pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{sub.content}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isViewing) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800 whitespace-pre-wrap">{viewingSubmission.content}</p>
        </div>
      );
    }

    if (showNewForm || (!hasSubmissions && joined)) {
      return (
        <div className="space-y-4">
          <textarea
            rows={5}
            placeholder="Write your submission..."
            className="resize-y w-full rounded-xl border border-gray-300 p-3 text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-sm transition-shadow"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </div>
      );
    }

    if (!joined) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Please accept a brand invitation to start submitting to campaigns.</p>
        </div>
      );
    }

    return null;
  };

  const renderButtons = () => {
    if (isViewing && isBrand) {
      const canAccept = viewingSubmission?.status === 'pending' || !viewingSubmission?.status;
      return (
        <>
          {canAccept && onAcceptSubmission && (
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-green-300 text-green-600 hover:bg-green-50 transition flex items-center gap-1"
            >
              <CheckCircle size={16} /> Accept
            </button>
          )}
          {canAccept && onRejectSubmission && (
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center gap-1"
            >
              <XCircle size={16} /> Reject
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleBackToList}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Back
            </button>
          </div>
        </>
      );
    }

    if (isViewing && onDeleteSubmission) {
      return (
        <>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center gap-1"
          >
            <Trash2 size={16} /> Delete
          </button>
          <div className="flex gap-3 ml-auto">
            {onUpdateSubmission && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition flex items-center gap-1"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </>
      );
    }

    if (isEditing) {
      return (
        <>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => { setIsEditing(false); setText(viewingSubmission?.content || ''); }}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={text.trim() === ''}
              className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition ${
                text.trim() === '' ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Save
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        {showNewForm && (
          <button
            onClick={() => setShowNewForm(false)}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Back to Submissions
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !joined || text.trim() === '' || status === 'inactive'
            }
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition ${
              text.trim() === '' || status === 'inactive'
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Submit
          </button>
        </div>
      </>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center px-4 py-10 sm:px-6">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            as={Fragment}
          >
            <DialogPanel className="relative w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-blue-200 hover:ring-blue-400 focus:outline-none transition-shadow">
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 transition"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                {!showSubmissionsList && (
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <Image
                      src={imageSrc}
                      alt={campaignTitle}
                      width={800}
                      height={300}
                      className="w-full h-48 sm:h-56 object-cover"
                      priority
                    />
                  </div>
                )}

                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {showSubmissionsList ? `Your Submissions - ${campaignTitle}` : campaignTitle}
                  </DialogTitle>
                  {viewingSubmission && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        viewingSubmission.status === 'accepted' ? 'bg-green-500' :
                        viewingSubmission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      } text-white`}>
                        {viewingSubmission.status || 'pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {viewingSubmission.createdAt ? new Date(viewingSubmission.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  )}
                  {!showSubmissionsList && (
                    <Description className="mt-2 text-gray-700 text-sm sm:text-base leading-relaxed">
                      {message.length > 140
                        ? message.slice(0, 140) + '...'
                        : message}
                    </Description>
                  )}
                </div>

                {renderContent()}

                <div className="flex justify-between gap-3">
                  {renderButtons()}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubmissionModal;