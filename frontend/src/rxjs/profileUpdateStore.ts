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
    const currentBio = localStorage.getItem('bio');
    const currentImage = localStorage.getItem('profileImage');

    const token = localStorage.getItem('token');
    const authHeaders = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    setProfileUpdateState({ status: 'loading', error: null });

    try {
      if (typeof profileImage === 'object') {
        const formData = new FormData();
        formData.append('profileImage', profileImage as File);

        await axiosInstance.patch('/users/profile-image', formData, {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data',
          },
        });
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

      if (bio !== currentBio) localStorage.setItem('bio', bio);
      if (typeof profileImage === 'string' && profileImage !== currentImage) {
        localStorage.setItem('profileImage', profileImage);
      }

      authStore.updateAuthState({
        bio,
        profileImage:
          typeof profileImage === 'string'
            ? profileImage
            : `/uploads/${profileImage.name}`,
      });

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
