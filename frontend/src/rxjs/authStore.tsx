import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import axiosInstance from './axiosInstance';
import { debounce } from 'lodash';
import { AxiosError } from 'axios';

type UserRole = 'brand' | 'influencer' | 'admin' | 'unknown';

interface ErrorResponseData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export type AuthFormState = {
  email: string;
  role: UserRole;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  profileImage?: string;
  bio?: string;
  category?: string;
  errors: Record<string, string>;
  submitting: boolean;
  success: boolean;
  serverMessage: string | null;
  roleDetected: boolean;
};

export type LoginResult =
  | { success: true; role: 'brand' | 'influencer' | 'admin' }
  | { success: false; message: string; throttle?: true };

export const initialAuthState: AuthFormState = {
  email: '',
  role: 'unknown',
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  profileImage: '',
  bio: '',
  category: '',
  errors: {},
  submitting: false,
  success: false,
  serverMessage: null,
  roleDetected: false,
};

const _authState$ = new BehaviorSubject<AuthFormState>(initialAuthState);
export const authState$ = _authState$
  .asObservable()
  .pipe(distinctUntilChanged());

function updateAuthState(update: Partial<AuthFormState>) {
  const newState = { ..._authState$.value, ...update };
  _authState$.next(newState);

  if (update.profileImage) {
    localStorage.setItem('profileImage', update.profileImage);
  }
  if (update.bio !== undefined) {
    localStorage.setItem('bio', update.bio);
  }
  if (update.username) {
    localStorage.setItem('username', update.username);
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

export const authStore = {
  state$: authState$,
  updateAuthState,

  setField(field: keyof AuthFormState, value: string | Record<string, string>) {
    updateAuthState({ [field]: value } as Partial<AuthFormState>);

    if (field === 'email' && typeof value === 'string') {
      debounce(async (email: string) => {
        if (!email) {
          updateAuthState({ role: 'unknown' });
          return;
        }

        try {
          const { data } = await axiosInstance.get(
            `/users/user-type?email=${email}`,
          );
          const role: UserRole = ['brand', 'influencer', 'admin'].includes(
            data.type,
          )
            ? data.type
            : 'unknown';

          updateAuthState({
            role,
            success: true,
            serverMessage: 'User type detected.',
          });
          localStorage.setItem('userType', role);
        } catch {
          updateAuthState({ role: 'unknown' });
        }
      }, 1000)(value);
    }
  },

  setErrors(errors: Record<string, string>) {
    updateAuthState({ errors });
  },

  reset() {
    _authState$.next(initialAuthState);
  },

  logout() {
    localStorage.removeItem('profileImage');
    localStorage.removeItem('bio');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    _authState$.next(initialAuthState);
  },

  getCurrentUser() {
    return _authState$.value;
  },

  async login(email: string, password: string): Promise<LoginResult> {
    updateAuthState({
      submitting: true,
      success: false,
      serverMessage: null,
      errors: {},
    });

    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      const user = response.data;

      updateAuthState({
        role: user.role,
        success: true,
        submitting: false,
        serverMessage: 'Login successful!',
        errors: {},
        roleDetected: false,
        password: '',
        confirmPassword: '',
      });

      return { success: true, role: user.role };
    } catch (error) {
      const isThrottle = isAxiosError(error) && error.response?.status === 429;
      const errMessage = isAxiosError(error)
        ? ((error.response?.data as ErrorResponseData)?.message ??
          'Login failed')
        : 'Something went wrong';

      updateAuthState({
        success: false,
        submitting: false,
        serverMessage: errMessage,
        errors: { server: errMessage },
        password: '',
        confirmPassword: '',
      });

      return {
        success: false,
        message: errMessage,
        ...(isThrottle ? { throttle: true } : {}),
      };
    }
  },

  async register() {
    const state = _authState$.value;

    if (state.password !== state.confirmPassword) {
      return authStore.setErrors({
        confirmPassword: 'Passwords do not match.',
      });
    }

    if (!['influencer', 'brand'].includes(state.role)) {
      return authStore.setErrors({ role: 'Please select a valid user type.' });
    }

    updateAuthState({ submitting: true, success: false, serverMessage: null });

    try {
      const url =
        state.role === 'influencer'
          ? '/auth/influencer/register'
          : '/auth/brand/register';

      await axiosInstance.post(url, {
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        username: state.username,
        name: state.name,
        profileImage: state.profileImage,
        category: state.category,
        bio: state.bio,
      });

      _authState$.next({
        ...initialAuthState,
        success: true,
        serverMessage: 'Registration successful.',
      });
    } catch (err: unknown) {
      let errors: Record<string, string> = {};
      let message = 'Unexpected error occurred.';

      if (isAxiosError(err) && err.response) {
        const data = err.response.data as ErrorResponseData;

        if (err.response.status === 409 && data.code === 'DUPLICATE_USER') {
          errors = {
            email: data.message || 'Duplicate user',
            username: data.message || 'Duplicate user',
          };
          message = data.message || message;
        } else {
          message = data.message || message;
        }
      }

      updateAuthState({
        submitting: false,
        errors,
        serverMessage: message,
        password: '',
        confirmPassword: '',
      });
    }
  },
};
