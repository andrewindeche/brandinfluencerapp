import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { campaignStore, CampaignType } from '../../rxjs/campaignStore';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: CampaignType | null;
  onCreate?: (newCampaign: CampaignType) => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  campaignToEdit,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaignToEdit) {
      setTitle(campaignToEdit.title);
      setInstructions(campaignToEdit.instructions);
      setStartDate(campaignToEdit.startDate);
      setEndDate(campaignToEdit.endDate);
      setStatus(campaignToEdit.status);
      setImages(campaignToEdit.images || []);
      setImagePreview(campaignToEdit.images?.[0] || '');
    } else {
      resetForm();
    }
  }, [campaignToEdit]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImages([result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title,
      instructions,
      images: images.length ? images : ['/images/campaign.jpg'],
      startDate,
      endDate,
      status,
    };

    try {
      if (campaignToEdit) {
        await campaignStore.updateCampaign(campaignToEdit.id, payload);
      } else {
        const createdCampaign = await campaignStore.createCampaign(payload);
        if (createdCampaign?.id && onCreate) {
          onCreate(createdCampaign);
        }
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting campaign:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setInstructions('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    setImagePreview('');
    setImages([]);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-blue bg-opacity-50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-zinc-900 p-4 text-gray-100 shadow-xl border border-zinc-700">
          <h2 className="text-lg font-bold mb-4">
            {campaignToEdit ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Campaign Title"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded text-gray-100 placeholder-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Campaign Description"
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded resize-none text-gray-100 placeholder-gray-300"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
            <input
              type="date"
              className="custom-date-icon w-full p-2 bg-zinc-800 border border-zinc-600 rounded text-gray-100"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="date"
              className="custom-date-icon w-full p-2 bg-zinc-800 border border-zinc-600 rounded text-gray-100"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <select
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded text-gray-100"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'active' | 'inactive')
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-100"
            />
            {(imagePreview || true) && (
              <Image
                src={imagePreview || '/images/campaign.jpg'}
                alt="Preview"
                width={500}
                height={300}
                className="w-full h-48 object-cover rounded"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-zinc-700 text-gray-200 hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 font-semibold"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="loader"></div>
                ) : campaignToEdit ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateCampaignModal;
