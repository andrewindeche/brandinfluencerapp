'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';

interface CampaignType {
  id: string;
  title: string;
  description: string;
  image: string;
  deadline: string;
  status: 'active' | 'inactive';
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: CampaignType) => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newCampaign: CampaignType = {
      id: uuidv4(),
      title,
      description,
      image: imagePreview || '/images/fit.jpg',
      deadline,
      status,
    };
    onCreate(newCampaign);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setStatus('active');
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-40"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4">Create New Campaign</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Campaign Title"
              className="w-full p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Campaign Description"
              className="w-full p-2 border rounded resize-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
            <select
              className="w-full p-2 border rounded"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'active' | 'inactive')
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateCampaignModal;
