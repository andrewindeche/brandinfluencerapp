import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import axiosInstance from './axiosInstance';
import { debounce } from 'lodash';
import { AxiosError } from 'axios';

type UserRole = 'brand' | 'influencer' | 'admin' | 'unknown';

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
  _authState$.next({ ..._authState$.value, ...update });
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

  async login(email: string, password: string) {
    if (!email || !password) {
      return updateAuthState({
        serverMessage: 'Email and password are required',
      });
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
    } catch (error) {
      let message = 'Login failed';
      let isThrottle = false;

      if (error instanceof AxiosError) {
        if (!error.response && error.request) {
          message = 'Too many attempts. Please try again later.';
          isThrottle = true;
        } else {
          message = error.response?.data?.message || message;
        }
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
    } catch (err) {
      let errors: Record<string, string> = {};
      let message = 'Unexpected error occurred.';

      if (err instanceof AxiosError && err.response) {
        if (
          err.response.status === 409 &&
          err.response.data?.code === 'DUPLICATE_USER'
        ) {
          errors = {
            email: err.response.data.message,
            username: err.response.data.message,
          };
          message = err.response.data.message;
        } else {
          message = err.response.data?.message || message;
        }
      }

      updateAuthState({ submitting: false, errors, serverMessage: message });
    }
  },
};
