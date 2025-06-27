import { BehaviorSubject } from 'rxjs';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { authStore } from './authStore';

type ProfileUpdateStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProfileUpdateState {
  status: ProfileUpdateStatus;
  error: string | null;
}

const _state$ = new BehaviorSubject<ProfileUpdateState>({
  status: 'idle',
  error: null,
});

export const profileUpdateState$ = _state$.asObservable();

function setProfileUpdateState(update: Partial<ProfileUpdateState>) {
  _state$.next({ ..._state$.value, ...update });
}

export const profileUpdateStore = {
  state$: profileUpdateState$,

  async updateProfile(
    bio: string,
    profileImage: File | string,
    showToast: (msg: string, type: 'success' | 'error') => void,
  ) {
    const { bio: currentBio, profileImage: currentImage } =
      authStore.getCurrentUser();

    const token = localStorage.getItem('token');
    const authHeaders = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    setProfileUpdateState({ status: 'loading', error: null });

    let uploadedFilename: string | undefined;

    try {
      if (typeof profileImage === 'object') {
        const formData = new FormData();
        formData.append('profileImage', profileImage);

        const response = await axiosInstance.patch(
          '/users/profile-image',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        uploadedFilename = response.data.imageUrl;
        return response.data.imageUrl;
      } else if (
        typeof profileImage === 'string' &&
        profileImage !== currentImage
      ) {
        await axiosInstance.patch(
          '/users/profile-image',
          { profileImage },
          authHeaders,
        );
      }

      if (bio !== currentBio) {
        await axiosInstance.patch('/users/bio', { bio }, authHeaders);
      }
      const updatedImage =
        typeof profileImage === 'string'
          ? profileImage
          : uploadedFilename
            ? `/${uploadedFilename}`
            : currentImage;
      authStore.updateAuthState({
        bio,
        profileImage: updatedImage,
      });

      localStorage.setItem('bio', bio);
      localStorage.setItem(
        'profileImage',
        updatedImage || '/images/default.png',
      );

      setProfileUpdateState({ status: 'success', error: null });
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile.';
      setProfileUpdateState({ status: 'error', error: message });
      showToast(message, 'error');
    }
  },

  resetState() {
    setProfileUpdateState({ status: 'idle', error: null });
  },
};
