import React, { useState, Fragment } from 'react';
import {
  Dialog,
  Description,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { TransitionChild } from '@headlessui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  imageSrc: string;
  message: string;
  onSubmit: (text: string) => void;
}

const SubmissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  campaignTitle,
  imageSrc,
  message,
  onSubmit,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() === '') return;
    onSubmit(text);
    setText('');
    onClose();
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

                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {campaignTitle}
                  </DialogTitle>
                  <Description className="mt-1 text-gray-700 text-sm sm:text-base leading-relaxed">
                    {message.length > 140
                      ? message.slice(0, 140) + '...'
                      : message}
                  </Description>
                </div>

                <textarea
                  rows={5}
                  placeholder="Write your submission..."
                  className="resize-y w-full rounded-xl border border-gray-300 p-3 text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-sm transition-shadow"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={text.trim() === ''}
                    className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition ${
                      text.trim() === ''
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Submit
                  </button>
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
