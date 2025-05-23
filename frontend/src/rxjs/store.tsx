import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import axiosInstance from './axiosInstance';
import { debounce } from 'lodash';
import { AxiosError } from 'axios';

type FormState = {
  confirmPassword: string;
  email: string;
  role: 'brand' | 'influencer' | 'admin' | 'unknown';
  name: string;
  username: string;
  profileImage?: string;
  password: string;
  category?: string;
  bio?: string;
  location?: string;
  errors: Record<string, string>;
  submitting: boolean;
  success: boolean;
  serverMessage: string | null;
};

export const initialState: FormState = {
  email: '',
  role: 'unknown',
  name: '',
  username: '',
  password: '',
  profileImage: '',
  confirmPassword: '',
  category: '',
  bio: '',
  location: '',
  errors: {},
  submitting: false,
  success: false,
  serverMessage: null,
};

const stateSubject = new BehaviorSubject<FormState>(initialState);
export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());

export const setFormField = (field: keyof FormState, value: string) => {
  stateSubject.next({ ...stateSubject.value, [field]: value });
};

export const setErrors = (newErrors: Record<string, string>) => {
  stateSubject.next({ ...stateSubject.value, errors: newErrors });
};

const fetchUserType = debounce(async (email: string) => {
  if (!email) {
    stateSubject.next({ ...stateSubject.value, role: 'unknown' });
    return;
  }

  try {
    const response = await axiosInstance.get(`/users/user-type?email=${email}`);
    console.log('User type response:', response.data);
    const validRoles = ['brand', 'influencer', 'admin', 'user'] as const;
    const role = validRoles.includes(response.data.type)
      ? response.data.type
      : 'unknown';
    stateSubject.next({
      ...initialState,
      email,
      role,
      submitting: false,
      success: true,
      serverMessage: 'Login successful!',
    });
    localStorage.setItem('userType', role);

    return { success: true, role };
  } catch {
    stateSubject.next({ ...stateSubject.value, role: 'unknown' });
  }
}, 1000);

export const setEmail = (email: string) => {
  stateSubject.next({ ...stateSubject.value, email });
  fetchUserType(email);
};

export const resetForm = () => {
  stateSubject.next(initialState);
};

export const submitLoginForm = async (email: string, password: string) => {
  const currentState = stateSubject.value;

  if (!email || !password) {
    stateSubject.next({
      ...currentState,
      serverMessage: 'Email and password are required',
    });
    return;
  }

  stateSubject.next({
    ...currentState,
    submitting: true,
    success: false,
    serverMessage: null,
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axiosInstance.get(`/users/user-type?email=${email}`);
    const {
      type: role = 'unknown',
      username = '',
      profileImage = '',
    } = response.data;

    localStorage.setItem('userType', role);
    localStorage.setItem('username', username);
    localStorage.setItem('profileImage', profileImage);

    stateSubject.next({
      ...initialState,
      email,
      role,
      username,
      profileImage,
      success: true,
      serverMessage: 'Login successful!',
      submitting: true,
    });

    return { success: true, role, username };
  } catch (error: unknown) {
    let message = 'Login failed';
    let isThrottleOrCors = false;

    if (error instanceof AxiosError) {
      if (!error.response && error.request) {
        message = 'Too many login attempts. Please wait and try again.';
        isThrottleOrCors = true;
      } else if (
        error.response?.data &&
        typeof error.response.data === 'object'
      ) {
        message =
          (error.response.data as { message?: string })?.message ?? message;
      }
    }

    stateSubject.next({
      ...currentState,
      submitting: false,
      success: false,
      serverMessage: message,
    });

    return { success: false, message, throttle: isThrottleOrCors };
  }
};

export const submitSignUpForm = async () => {
  const formState = stateSubject.value;

  if (formState.password !== formState.confirmPassword) {
    return setErrors({ confirmPassword: 'Passwords do not match.' });
  }

  if (formState.role === 'unknown') {
    return setErrors({ role: 'Please select a valid user type.' });
  }

  stateSubject.next({
    ...formState,
    submitting: true,
    success: false,
    serverMessage: null,
  });

  try {
    const url =
      formState.role === 'influencer'
        ? '/auth/influencer/register'
        : formState.role === 'brand'
          ? '/auth/brand/register'
          : undefined;
    if (!url) {
      return setErrors({ role: 'Please select a valid user type.' });
    }

    await axiosInstance.post(url, {
      email: formState.email,
      password: formState.password,
      confirmPassword: formState.confirmPassword,
      username: formState.username,
      name: formState.name,
      profileImage: formState.profileImage,
      role: formState.role,
      category: formState.category,
      bio: formState.bio,
      location: formState.location,
    });

    stateSubject.next({
      ...initialState,
      success: true,
      serverMessage: 'Registration successful.',
    });
  } catch (error: unknown) {
    let newErrors: Record<string, string> = {};
    let message = 'Unexpected error occurred.';

    if (error instanceof AxiosError && error.response) {
      const { status, data } = error.response;

      if (status === 409 && data?.code === 'DUPLICATE_USER') {
        newErrors = { email: data.message, username: data.message };
        message = data.message;
      } else if (typeof data === 'object' && data?.message) {
        message = data.message;
      }
    }

    stateSubject.next({
      ...formState,
      submitting: false,
      errors: newErrors,
      serverMessage: message,
    });
  }
};
