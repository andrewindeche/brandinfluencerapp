import React, { useState } from 'react';
import {
  Dialog,
  Description,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X } from 'lucide-react';
import Image from 'next/image';

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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 transition"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col space-y-5">
            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
              <Image
                src={imageSrc}
                alt={campaignTitle}
                width={800}
                height={300}
                className="w-full h-44 sm:h-52 object-cover"
                priority
              />
            </div>

            <div>
              <DialogTitle className="text-2xl font-semibold text-gray-900 mb-1">
                {campaignTitle}
              </DialogTitle>
              <Description className="text-gray-700 text-base leading-relaxed">
                {message.length > 140 ? message.slice(0, 140) + '...' : message}
              </Description>
            </div>

            <textarea
              rows={5}
              placeholder="Enter your submission here..."
              className="w-full rounded-2xl border border-gray-300 p-3 text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-shadow resize-none shadow-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2 font-semibold rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={text.trim() === ''}
                className={`px-5 py-2 font-semibold rounded-2xl text-white transition ${
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
      </div>
    </Dialog>
  );
};

export default SubmissionModal;
