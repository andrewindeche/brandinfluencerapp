import { BehaviorSubject } from 'rxjs';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { authStore } from './authStore';
import { ProfileUpdateStatus } from '../types';
import { ProfileUpdateState } from '../interfaces';

const _state$ = new BehaviorSubject<ProfileUpdateState>({
  status: 'idle',
  error: null,
});

export const profileUpdateState$ = _state$.asObservable();

function setProfileUpdateState(update: Partial<ProfileUpdateState>) {
  _state$.next({ ..._state$.value, ...update });
}

export const profileUpdateStore = {
  async updateProfile(
    bio: string,
    profileImage: File | string,
    showToast: (msg: string, type: 'success' | 'error') => void,
  ): Promise<string> {
    const { bio: currentBio, profileImage: currentImage } =
      authStore.getCurrentUser();

    console.log('[ProfileUpdateStore] Current state:', { currentBio, currentImage, newBio: bio, newImage: profileImage });

    setProfileUpdateState({ status: 'loading', error: null });

    let updatedImage = currentImage;
    let uploadedFilename: string | undefined;

    try {
      if (profileImage && typeof profileImage === 'object') {
        const formData = new FormData();
        formData.append('profileImage', profileImage);

        const response = await axiosInstance.patch(
          '/users/profile-image',
          formData,
        );
        if (!response.data.imageUrl) {
          throw new Error('No image URL returned from server');
        }

        uploadedFilename = response.data.imageUrl;
        updatedImage = uploadedFilename;
      } else if (
        profileImage &&
        typeof profileImage === 'string' &&
        profileImage !== currentImage
      ) {
        updatedImage = profileImage;
        await axiosInstance.patch('/users/profile-image', { profileImage });
      }

      localStorage.setItem(
        'profileImage',
        updatedImage || '/images/image4.png',
      );
    } catch (imageError) {
      console.log('[ProfileUpdateStore] Image update failed, continuing with bio only');
    }

    if (bio !== currentBio) {
      console.log('[ProfileUpdateStore] Updating bio:', { currentBio, newBio: bio });
      try {
        await axiosInstance.patch('/users/bio', { bio });
      } catch (bioError) {
        console.log('[ProfileUpdateStore] Bio update failed:', bioError);
      }
    }

    try {
      authStore.updateAuthState({
        bio,
        profileImage: updatedImage || '/images/image4.png',
      });

      localStorage.setItem('bio', bio);

      setProfileUpdateState({ status: 'success', error: null });
      showToast('Profile updated successfully!', 'success');

      return `${updatedImage}?t=${Date.now()}`;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile.';
      setProfileUpdateState({ status: 'error', error: message });
      showToast(message, 'error');
      return currentImage || '/images/image4.png';
    }
  },
};
