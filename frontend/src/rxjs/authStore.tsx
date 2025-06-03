import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { debounce } from 'lodash';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { setUser } from './userStore';

export type UserRole = 'brand' | 'influencer' | 'admin' | 'unknown';

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
  | { success: true; role: Exclude<UserRole, 'unknown'> }
  | { success: false; message: string; throttle?: true };

const initialAuthState: AuthFormState = {
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
  _authState$.next({ ..._authState$.value, ...update });
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError;
}

let lastDetectedRole: UserRole = 'unknown';

const debouncedDetectUserRole = debounce(async (email: string) => {
  if (!email) {
    updateAuthState({ role: 'unknown' });
    return;
  }

  try {
    const { data } = await axiosInstance.get(
      `/users/user-type?email=${encodeURIComponent(email)}`,
    );

    const role: UserRole = ['brand', 'influencer', 'admin'].includes(data.type)
      ? data.type
      : 'unknown';

    if (role !== lastDetectedRole) {
      updateAuthState({
        role,
        success: true,
        serverMessage: null,
        errors: {},
      });
      lastDetectedRole = role;
      localStorage.setItem('userType', role);
    }
  } catch (err) {
    const message =
      isAxiosError(err) && err.response?.status === 429
        ? 'Too many attempts. Try again later.'
        : 'Failed to detect user type.';

    updateAuthState({
      role: 'unknown',
      serverMessage: message,
      errors: { server: message },
    });

    lastDetectedRole = 'unknown';
  }
}, 1000);

export const authStore = {
  state$: authState$,
  updateAuthState,

  setField(field: keyof AuthFormState, value: string | Record<string, string>) {
    updateAuthState({ [field]: value } as Partial<AuthFormState>);
    if (field === 'email' && typeof value === 'string') {
      debouncedDetectUserRole(value);
    }
  },

  setErrors(errors: Record<string, string>) {
    updateAuthState({ errors });
  },

  reset() {
    _authState$.next(initialAuthState);
  },

  logout() {
    localStorage.clear();
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
      const { role } = _authState$.value;
      const rolePath = role === 'influencer' ? 'influencer' : 'brand';
      const { data } = await axiosInstance.post(`/auth/${rolePath}/login`, {
        email,
        password,
      });
      updateAuthState({
        role: data.role,
        success: true,
        submitting: false,
        serverMessage: 'Login successful!',
        errors: {},
        roleDetected: false,
        password: '',
        confirmPassword: '',
      });
      setUser(data);
      return { success: true, role: data.role };
    } catch (error) {
      const isThrottle = isAxiosError(error) && error.response?.status === 429;
      const message = isAxiosError(error)
        ? (error.response?.data as ErrorResponseData)?.message || 'Login failed'
        : 'Something went wrong';
      updateAuthState({
        submitting: false,
        success: false,
        serverMessage: message,
        errors: { server: message },
        password: '',
        confirmPassword: '',
      });
      return {
        success: false,
        message,
        ...(isThrottle ? { throttle: true } : {}),
      };
    }
  },

  async register() {
    const state = _authState$.value;
    if (state.password !== state.confirmPassword) {
      return this.setErrors({ confirmPassword: 'Passwords do not match.' });
    }
    if (!['brand', 'influencer'].includes(state.role)) {
      return this.setErrors({ role: 'Please select a valid user type.' });
    }
    updateAuthState({ submitting: true, success: false });
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
    } catch (err) {
      let errors: Record<string, string> = {};
      let message = 'Unexpected error occurred.';
      if (isAxiosError(err) && err.response) {
        const data = err.response.data as ErrorResponseData;
        if (err.response.status === 409 && data.code === 'DUPLICATE_USER') {
          errors = {
            email: data.message || 'Duplicate',
            username: data.message || 'Duplicate',
          };
        }
        message = data.message || message;
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
