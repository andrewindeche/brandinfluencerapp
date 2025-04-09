import { BehaviorSubject } from 'rxjs';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

type PasswordResetState = {
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

export const sendResetEmail = async () => {
  const { email } = passwordResetSubject.value;
  passwordResetSubject.next({
    ...passwordResetSubject.value,
    resetStatus: 'loading',
  });

  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    const previewLink = response.data.previewLink;

    passwordResetSubject.next({
      ...passwordResetSubject.value,
      resetStatus: 'success',
    });

    return previewLink;
  } catch (error: unknown) {
    let errorMessage = 'Failed to send reset email. Try again later.';
    if (error instanceof Error) {
      if (error.message) {
        errorMessage = error.message;
      }
    } else if (error instanceof AxiosError && error.response) {
      if (error.response.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
    }

    passwordResetSubject.next({
      ...passwordResetSubject.value,
      resetStatus: 'error',
      errorMessage,
    });

    return null;
  }
};

export const resetPassword = async () => {
  const { token, newPassword, confirmPassword } = passwordResetSubject.value;

  if (newPassword !== confirmPassword) {
    passwordResetSubject.next({
      ...passwordResetSubject.value,
      resetStatus: 'error',
      errorMessage: 'Passwords do not match.',
    });
    return;
  }

  passwordResetSubject.next({
    ...passwordResetSubject.value,
    resetStatus: 'loading',
  });

  try {
    await axiosInstance.post('/auth/reset-password', {
      token,
      newPassword,
    });
    passwordResetSubject.next({
      ...initialResetState,
      resetStatus: 'success',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    passwordResetSubject.next({
      ...passwordResetSubject.value,
      resetStatus: 'error',
      errorMessage: `Failed to reset password: ${errorMessage}`,
    });
  }
};
