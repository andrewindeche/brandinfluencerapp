import { BehaviorSubject } from 'rxjs';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export type PasswordResetState = {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
  resetStatus: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
};

const initialResetState: PasswordResetState = {
  email: '',
  token: '',
  newPassword: '',
  confirmPassword: '',
  resetStatus: 'idle',
};

const passwordResetSubject = new BehaviorSubject<PasswordResetState>(
  initialResetState,
);

export const passwordResetState$ = passwordResetSubject.asObservable();

export const setResetField = (
  field: keyof PasswordResetState,
  value: string,
) => {
  passwordResetSubject.next({
    ...passwordResetSubject.value,
    [field]: value,
  });
};

const updateResetState = (partial: Partial<PasswordResetState>) => {
  passwordResetSubject.next({
    ...passwordResetSubject.value,
    ...partial,
  });
};

const handleResetError = (error: unknown, fallback = 'An error occurred.') => {
  let errorMessage = fallback;

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    errorMessage = (error as { message: string }).message;
  }

  updateResetState({ resetStatus: 'error', errorMessage });
};

export const sendResetEmail = async () => {
  const { email } = passwordResetSubject.value;
  updateResetState({ resetStatus: 'loading' });

  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    const previewLink = response.data.previewLink;

    updateResetState({ resetStatus: 'success' });

    return previewLink;
  } catch (error: unknown) {
    let errorMessage = 'Failed to send reset email. Try again later.';

    if (error instanceof AxiosError && error.response?.status === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
    }

    handleResetError(error, errorMessage);
    return null;
  }
};

export const resetPassword = async () => {
  const { token, newPassword, confirmPassword } = passwordResetSubject.value;

  if (newPassword !== confirmPassword) {
    updateResetState({
      resetStatus: 'error',
      errorMessage: 'Passwords do not match.',
    });
    return;
  }

  updateResetState({ resetStatus: 'loading' });

  try {
    await axiosInstance.post(`/auth/reset-password/${token}`, {
      password: newPassword,
    });

    passwordResetSubject.next({
      ...initialResetState,
      resetStatus: 'success',
    });
  } catch (error) {
    handleResetError(error, 'Failed to reset password');
  }
};
