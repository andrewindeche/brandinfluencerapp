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
    profileImage: string,
    showToast: (msg: string, type: 'success' | 'error') => void,
  ) {
    const currentBio = localStorage.getItem('bio');
    const currentImage = localStorage.getItem('profileImage');

    if (bio === currentBio && profileImage === currentImage) {
      showToast('No changes detected.', 'error');
      return;
    }

    setProfileUpdateState({ status: 'loading', error: null });

    try {
      await axiosInstance.patch('/users/me', { bio, profileImage });

      localStorage.setItem('bio', bio);
      localStorage.setItem('profileImage', profileImage);

      authStore.updateAuthState({ bio, profileImage });

      setProfileUpdateState({ status: 'success', error: null });
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update failed:', error);

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
