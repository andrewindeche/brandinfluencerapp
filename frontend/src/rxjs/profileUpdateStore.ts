import { BehaviorSubject } from 'rxjs';
import axiosInstance from '../rxjs/axiosInstance';
import { AxiosError } from 'axios';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ProfileUpdateState {
  status: Status;
  error: string | null;
}

const state$ = new BehaviorSubject<ProfileUpdateState>({
  status: 'idle',
  error: null,
});

export const profileUpdateStore = {
  state$,

  async updateProfile(
    bio: string,
    profileImage: string,
    showToast: (msg: string, type: 'success' | 'error') => void,
  ) {
    state$.next({ status: 'loading', error: null });
    try {
      await axiosInstance.patch('/users/me', { bio, profileImage });
      state$.next({ status: 'success', error: null });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile.';
      state$.next({ status: 'error', error: message });
      showToast(message, 'error');
    }
  },
};
