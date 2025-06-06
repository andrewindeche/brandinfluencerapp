import {
  BehaviorSubject,
  filter,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { setUser } from './userStore';
import { z } from 'zod';

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

const loginSchemaBase = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Email is required')
    .email('Invalid email format')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid characters in email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        'Password must contain at least one uppercase letter and one number',
    })
    .refine((val) => !['password', '123456', 'qwerty'].includes(val), {
      message: 'Password is too common',
    }),
});

const loginSchema = loginSchemaBase.refine(
  (data: z.infer<typeof loginSchemaBase>) => data.email !== data.password,
  {
    message: 'Username and password must not match!',
    path: ['credentials'],
  },
);

const registerSchema = loginSchemaBase
  .extend({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(20, 'Username must be at most 20 characters long')
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message:
          'Username can only contain letters, numbers, dots, underscores, and hyphens',
      }),
    confirmPassword: z.string().nonempty('Confirmation password is required'),
    role: z.enum(['brand', 'influencer', 'admin', 'superuser'], {
      errorMap: () => ({ message: 'Please select a valid user type.' }),
    }),
  })
  .refine(
    (data: z.infer<typeof loginSchemaBase> & { confirmPassword: string }) =>
      data.password === data.confirmPassword,
    {
      message: 'Confirmation password must match the password',
      path: ['confirmPassword'],
    },
  )
  .refine(
    (data: z.infer<typeof loginSchemaBase> & { username: string }) =>
      data.username !== data.password,
    {
      message: 'Username and password must not match!',
      path: ['credentials'],
    },
  );

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
const email$ = new BehaviorSubject<string>('');

authState$.subscribe();

email$
  .pipe(
    debounceTime(600),
    distinctUntilChanged(),
    filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    switchMap((email) =>
      axiosInstance
        .get(`/users/user-type?email=${encodeURIComponent(email)}`)
        .then((res) => {
          if (!res.data || typeof res.data.type !== 'string') {
            throw new Error('Invalid response format from user-type endpoint');
          }
          return { type: res.data.type as UserRole };
        })
        .catch((err: unknown) => {
          const message =
            isAxiosError(err) && err.response?.status === 429
              ? 'Too many attempts. Try again later.'
              : 'Failed to detect user type.';
          return { error: message };
        }),
    ),
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
      if (result.type !== lastDetectedRole) {
        updateAuthState({
          role: result.type,
          success: true,
          serverMessage: null,
          errors: {},
          roleDetected: true,
        });
        lastDetectedRole = result.type;
        localStorage.setItem('userType', result.type);
      }
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
      updateAuthState({
        role: data.user.role,
        success: true,
        submitting: false,
        serverMessage: 'Login successful!',
        errors: {},
        roleDetected: false,
        password: '',
        confirmPassword: '',
      });
      setUser(data.user);
      return { success: true, role: data.user.role };
    } catch (error: unknown) {
      const isThrottle = isAxiosError(error) && error.response?.status === 429;
      const message = isAxiosError(error)
        ? (error.response?.data as ErrorResponseData)?.message || 'Login failed'
        : 'Too many Login Attempts.Try Again Later';
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
