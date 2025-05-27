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
};

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

const fetchUserRole = debounce(async (email: string) => {
  if (!email) return updateAuthState({ role: 'unknown' });

  try {
    const { data } = await axiosInstance.get(`/users/user-type?email=${email}`);
    const role: UserRole = ['brand', 'influencer', 'admin'].includes(data.type)
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
}, 1000);

export const authStore = {
  state$: authState$,
  updateAuthState,

  setField(field: keyof AuthFormState, value: string) {
    updateAuthState({ [field]: value } as Partial<AuthFormState>);
    if (field === 'email') fetchUserRole(value);
  },

  setErrors(errors: Record<string, string>) {
    updateAuthState({ errors });
  },

  reset() {
    _authState$.next(initialAuthState);
  },

  getCurrentUser() {
    return _authState$.value;
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      updateAuthState({
        serverMessage: 'Email and password are required',
      });
      return { success: false, message: 'Email and password are required' };
    }

    updateAuthState({ submitting: true, success: false, serverMessage: null });

    try {
      const { data } = await axiosInstance.get(
        `/users/user-type?email=${email}`,
      );
      const { type: role = 'unknown', username = '', profileImage = '' } = data;

      localStorage.setItem('userType', role);
      localStorage.setItem('username', username);
      localStorage.setItem('profileImage', profileImage);

      _authState$.next({
        ...initialAuthState,
        email,
        role,
        username,
        profileImage,
        submitting: false,
        success: true,
        serverMessage: 'Login successful!',
      });

      return { success: true, role, username };
    } catch (error: unknown) {
      let message = 'Login failed';
      let isThrottle = false;

      if (isAxiosError(error)) {
        if (error.response) {
          const data = error.response.data as ErrorResponseData;
          if (error.response.status === 429) {
            message =
              'Too many login attempts. Please wait and try again later.';
            isThrottle = true;
          } else {
            message = data.message || message;
          }
        } else if (error.request) {
          message = 'No response from server. Please check your connection.';
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      updateAuthState({
        submitting: false,
        success: false,
        serverMessage: message,
      });

      return { success: false, message, throttle: isThrottle };
    }
  },

  async register() {
    const state = _authState$.value;

    if (state.password !== state.confirmPassword) {
      return authStore.setErrors({
        confirmPassword: 'Passwords do not match.',
      });
    }

    if (state.role === 'unknown') {
      return authStore.setErrors({ role: 'Please select a valid user type.' });
    }

    updateAuthState({ submitting: true, success: false, serverMessage: null });

    try {
      const url =
        state.role === 'influencer'
          ? '/auth/influencer/register'
          : state.role === 'brand'
            ? '/auth/brand/register'
            : '';

      if (!url) return authStore.setErrors({ role: 'Invalid role.' });

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

      updateAuthState({ submitting: false, errors, serverMessage: message });
    }
  },
};
