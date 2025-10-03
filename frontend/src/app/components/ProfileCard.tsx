import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { getRandom } from '../utils/random';

type ProfileWithStatsProps = {
  username: string;
  profileImage: string;
  bio: string;
  likes: number;
  shares: number;
  campaigns: number;
  posts: number;
  submissions: number;
  defaultImage?: string;
  onSave: (newBio: string, newImage: File | string | null) => Promise<void>;
  loading?: boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
};

const ProfileWithStats: React.FC<ProfileWithStatsProps> = ({
  username,
  profileImage,
  bio,
  onSave,
  loading = false,
  showToast,
}) => {
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [likes] = useState(() => getRandom(50, 300));
  const [shares] = useState(() => getRandom(10, 100));
  const [campaigns] = useState(() => getRandom(1, 10));
  const [posts] = useState(() => getRandom(3, 25));
  const [submissions] = useState(() => getRandom(1, 15));

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE_MB = 5;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        showToast(`Image must be smaller than ${MAX_SIZE_MB}MB.`, 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finalImageSrc =
    imagePreview ??
    (profileImage && profileImage !== 'undefined'
      ? `${profileImage}?t=${Date.now()}`
      : '/images/image4.png');

  const handleSaveBio = async () => {
    try {
      await onSave(bioDraft, null);
      setEditingBio(false);
      showToast('Bio updated successfully!', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network error. Try again.';
      showToast(message, 'error');
    }
  };

  const handleSaveImage = async () => {
    if (!imageFile) {
      showToast('Please select an image first.', 'error');
      return;
    }
    setImageLoading(true);
    try {
      await onSave(bio, imageFile);
      setImageFile(null);
      setImagePreview(null);
      showToast('Profile image updated!', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network error. Try again.';
      showToast(message, 'error');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div
        className="p-1 bg-black text-white rounded-2xl relative shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative group rounded-lg overflow-hidden shadow-lg">
          <Image
            src={finalImageSrc}
            alt={username}
            width={200}
            height={150}
            className="w-full h-[400px] object-cover rounded-lg"
          />

          <label
            htmlFor="profileImageUpload"
            className="absolute top-2 right-2 bg-black/50 hover:bg-yellow-400 text-white hover:text-black p-2 rounded-full cursor-pointer transition-colors"
            title="Change profile image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-4.553a1.414 1.414 0 10-2-2L13 8m2 2l-6 6M3 21h18"
              />
            </svg>
          </label>

          <input
            id="profileImageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
            disabled={loading || imageLoading}
          />

          {imageFile && (
            <button
              onClick={handleSaveImage}
              className="absolute top-12 right-2 bg-yellow-400 text-black px-3 py-1 rounded shadow disabled:opacity-50"
              disabled={imageLoading}
            >
              {imageLoading ? 'Updating...' : 'Update Image'}
            </button>
          )}

          <div className="absolute transform -translate-x-1/2 rotate-12 px-20 py-3 bottom-6 left-1/2 text-lg bg-black/30 text-white p-2 rounded-full z-10">
            <span className="inline-block transform -rotate-12">
              {username}
            </span>
          </div>

          <div className="absolute top-4 left-1 text-center z-10 space-y-1">
            <div className="bg-black/20 text-white p-3 rounded-full rotate-12">
              <span className="inline-block transform -rotate-12">
                {likes} likes
              </span>
            </div>
            <div className="bg-black/20 rotate-12 text-xs p-3 rounded-full">
              <span className="inline-block transform -rotate-12">
                {shares} shares
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-b border-white py-4 px-2 text-center text-xs mt-2">
          <p>Influencer Network</p>
          <p className="text-gray-400">16/01/2025</p>
        </div>

        <div
          className={`h-24 px-2 mt-2 ${
            isHovered ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
          {!editingBio ? (
            <>
              <button
                onClick={() => {
                  setBioDraft(bio);
                  setEditingBio(true);
                }}
                className="flex items-center gap-1 mt-2 text-yellow-400 hover:text-yellow-300 transition-colors mx-auto"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5h10M11 9h7M5 9h.01M5 13h10M5 17h6"
                  />
                </svg>
                Edit Bio
              </button>
              <p className="text-center text-sm md:text-base whitespace-pre-wrap">
                {bio}
              </p>
            </>
          ) : (
            <>
              <textarea
                rows={6}
                className="w-full p-2 rounded text-white resize-y"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                disabled={loading}
                placeholder="Edit your bio here..."
              />
              <div className="flex gap-4 mt-2 justify-center">
                <button
                  onClick={handleSaveBio}
                  className="bg-yellow-400 text-black px-4 py-1 rounded disabled:opacity-50"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingBio(false);
                    setBioDraft('');
                  }}
                  className="bg-gray-600 px-4 py-1 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-2 pb-4">
          <hr className="border-t border-white my-2" />
        </div>
      </div>

      <div className="pb-6 px-2 py-4 border border-white bg-black text-white rounded-xl shadow-lg w-full mx-auto flex justify-around">
        <div className="text-center">
          <p className="text-3xl font-bold">{campaigns}</p>
          <p className="text-xs">Campaigns</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">{posts}</p>
          <p className="text-xs">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">{submissions}</p>
          <p className="text-xs">Submissions</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileWithStats;
