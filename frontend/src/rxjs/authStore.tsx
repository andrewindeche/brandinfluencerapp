import {
  BehaviorSubject,
  filter,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import axiosInstance, { setAuthToken } from './axiosInstance';
import { AxiosError } from 'axios';
import { setUser } from './userStore';
import { loginSchema } from './validation/loginSchema';
import { registerSchema } from './validation/registerSchema';

export type UserRole = 'brand' | 'influencer' | 'admin' | 'unknown';

interface ErrorResponseData {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

interface AxiosCustomError {
  message: string;
  code?: string;
}

function isAxiosCustomError(err: unknown): err is AxiosCustomError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as Record<string, unknown>).message === 'string'
  );
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
  roleDetected: true,
};

const _authState$ = new BehaviorSubject<AuthFormState>(initialAuthState);
if (typeof window !== 'undefined') {
  const savedUsername = localStorage.getItem('username') || '';
  const savedBio = localStorage.getItem('bio') || '';
  const savedProfileImage = localStorage.getItem('profileImage') || '';

  if (savedUsername || savedBio || savedProfileImage) {
    _authState$.next({
      ..._authState$.value,
      username: savedUsername,
      bio: savedBio,
      profileImage: savedProfileImage,
    });
  }
}

export const authState$ = _authState$
  .asObservable()
  .pipe(distinctUntilChanged());

function updateAuthState(update: Partial<AuthFormState>) {
  const newState = { ..._authState$.value, ...update };

  if (typeof window !== 'undefined') {
    if (update.username) localStorage.setItem('username', update.username);
    if (update.bio) localStorage.setItem('bio', update.bio);
    if (update.profileImage)
      localStorage.setItem('profileImage', update.profileImage);
  }

  _authState$.next(newState);
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError;
}

let lastDetectedRole: UserRole = 'unknown';
console.log('Last detected role:', lastDetectedRole);
const email$ = new BehaviorSubject<string>('');

email$
  .pipe(
    debounceTime(600),
    filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())),
    switchMap((email) => {
      updateAuthState({
        roleDetected: false,
        role: 'unknown',
        serverMessage: null,
        errors: {},
      });

      return axiosInstance
        .get(`/users/user-type?email=${encodeURIComponent(email.trim())}`)
        .then((res) => {
          if (!res.data || typeof res.data.type !== 'string') {
            throw new Error('Invalid response format from user-type endpoint');
          }
          return {
            type: res.data.type as UserRole,
            username: res.data.username,
          };
        })
        .catch((err: unknown) => {
          const message =
            isAxiosError(err) && err.response?.status === 429
              ? 'Too many attempts. Try again later.'
              : 'Request timeout. Try again later';
          return { error: message };
        });
    }),
  )
  .subscribe((result) => {
    if ('error' in result) {
      updateAuthState({
        role: 'unknown',
        roleDetected: false,
        serverMessage: result.error,
        errors: { server: result.error },
      });
      lastDetectedRole = 'unknown';
    } else if (['brand', 'influencer', 'admin'].includes(result.type)) {
      updateAuthState({
        role: result.type,
        username: result.username || '',
        success: true,
        serverMessage: null,
        errors: {},
        roleDetected: true,
      });
      lastDetectedRole = result.type;
      localStorage.setItem('userType', result.type);
    }
  });

export const authStore = {
  state$: authState$,
  updateAuthState,

  setField(field: keyof AuthFormState, value: string | Record<string, string>) {
    updateAuthState({ [field]: value } as Partial<AuthFormState>);
    if (field === 'email' && typeof value === 'string') {
      email$.next(value);
    }
  },

  setErrors(errors: Record<string, string>) {
    const current = _authState$.value;
    _authState$.next({
      ...current,
      errors: errors || {},
    });
  },

  reset() {
    _authState$.next(initialAuthState);
  },

  logout() {
    localStorage.clear();
    sessionStorage.removeItem('toastMessage');
    localStorage.removeItem('token');
    setAuthToken(null);
    _authState$.next(initialAuthState);
  },

  getCurrentUser() {
    const current = _authState$.value;
    return {
      ...current,
      errors: current.errors || {},
    };
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0]?.toString() || 'form';
        fieldErrors[key] = err.message;
      });
      this.setErrors(fieldErrors);
      return { success: false, message: 'Validation failed' };
    }

    if (
      _authState$.value.role === 'unknown' ||
      !_authState$.value.roleDetected
    ) {
      return {
        success: false,
        message: 'Please wait until your role is detected before logging in.',
      };
    }

    updateAuthState({
      submitting: true,
      success: false,
      serverMessage: null,
      errors: {},
    });

    try {
      const rolePath =
        _authState$.value.role === 'influencer' ? 'influencer' : 'brand';
      const { data } = await axiosInstance.post(`/auth/${rolePath}/login`, {
        email,
        password,
      });
      localStorage.setItem('token', data.access_token);
      setAuthToken(data.access_token);
      updateAuthState({
        role: data.user.role,
        success: true,
        bio: data.user.bio || '',
        profileImage: data.user.profileImage
          ? `http://localhost:4000/${data.user.profileImage}`
          : '/images/image4.png',

        submitting: false,
        serverMessage: 'Login successful!',
        errors: {},
        roleDetected: false,
        password: '',
        confirmPassword: '',
      });
      setUser(data.user);
      localStorage.setItem('username', data.user.username || '');
      localStorage.setItem(
        'profileImage',
        `http://localhost:4000/${data.user.profileImage}`,
      );
      localStorage.setItem('bio', data.user.bio || '');

      return { success: true, role: data.user.role };
    } catch (error: unknown) {
      const isThrottle = isAxiosError(error) && error.response?.status === 429;
      const message = isAxiosError(error)
        ? (error.response?.data as ErrorResponseData)?.message || 'Login failed'
        : 'Too many Login Attempts. Try Again Later';

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
    const result = registerSchema.safeParse(state);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0]?.toString() || 'form';
        fieldErrors[key] = err.message;
      });
      return this.setErrors(fieldErrors);
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
        role: state.role,
      });

      _authState$.next({
        ...initialAuthState,
        success: true,
        serverMessage: 'Registration successful.',
      });
    } catch (err: unknown) {
      let errors: Record<string, string> = {};
      let message = 'Unexpected error occurred.';
      let code: string | undefined;

      if (isAxiosCustomError(err)) {
        message = err.message || message;
        code = err.code;

        if (
          code === 'DUPLICATE_USER' ||
          message.toLowerCase().includes('exists')
        ) {
          errors = {
            email: message,
            username: message,
          };
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
