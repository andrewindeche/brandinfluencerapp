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
  password: string;
  category?: string;
  bio?: string;
  location?: string;
  errors: Record<string, string>;
};

export const initialState: FormState = {
  email: '',
  role: 'unknown',
  name: '',
  username: '',
  password: '',
  category: '',
  bio: '',
  location: '',
  confirmPassword: '',
  errors: {},
};

const stateSubject = new BehaviorSubject<FormState>(initialState);

export const setErrors = (newErrors: Record<string, string>) => {
  stateSubject.next({
    ...stateSubject.value,
    errors: newErrors,
  });
};

const fetchUserType = debounce(async (email: string) => {
  if (!email) {
    stateSubject.next({ ...stateSubject.value, role: 'unknown' });
    return;
  }

  try {
    const response = await axiosInstance.get(`/users/user-type?email=${email}`);
    const role = response.data.type;
    stateSubject.next({ ...stateSubject.value, role });
  } catch (error) {
    console.error('Error fetching user type:', error);
    stateSubject.next({ ...stateSubject.value, role: 'unknown' });
  }
}, 1000);

export const setEmail = (email: string) => {
  stateSubject.next({
    ...stateSubject.value,
    email,
  });

  fetchUserType(email);
};

export const setFormField = (field: keyof FormState, value: string) => {
  stateSubject.next({
    ...stateSubject.value,
    [field]: value,
  });
};

export const submitSignUpForm = async (
  navigateToLogin: () => void,
  setShowErrorDialog: (show: boolean) => void,
  setErrors: (errors: Record<string, string>) => void,
) => {
  const formState = stateSubject.value;

  if (formState.password !== formState.confirmPassword) {
    setErrors({ confirmPassword: 'Passwords do not match.' });
    return;
  }

  const signUpData = {
    email: formState.email,
    role: formState.role,
    name: formState.name,
    username: formState.username,
    password: formState.password,
    confirmPassword: formState.confirmPassword,
    category: formState.category,
    bio: formState.bio,
    location: formState.location,
  };

  if (formState.role === 'unknown') {
    setErrors({ role: 'Please select a valid user type.' });
    return;
  }

  const apiEndpoint =
    formState.role === 'influencer'
      ? '/auth/influencer/register'
      : formState.role === 'brand'
        ? '/auth/brand/register'
        : '/auth/other/register';

  try {
    const response = await axiosInstance.post(apiEndpoint, signUpData);
    console.log('Sign up successful:', response.data);
    stateSubject.next(initialState);
    navigateToLogin();
  } catch (error: unknown) {
    stateSubject.next(initialState);

    if (error instanceof AxiosError) {
      const customError = error.response?.data || {};

      setShowErrorDialog(true);

      if (customError.code === 'DUPLICATE_USER') {
        setErrors({
          email: customError.message || 'The email or username already exists.',
        });
      } else {
        setErrors({
          general:
            customError.message ||
            'Failed to sign up. Please check your information and try again.',
        });
      }
    } else {
      setErrors({ general: 'Unexpected error occurred. Please try again.' });
      console.error('Unexpected error:', error);
    }
  }
};

export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());
