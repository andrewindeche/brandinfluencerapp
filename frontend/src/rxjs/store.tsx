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
};

const stateSubject = new BehaviorSubject<FormState>(initialState);

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
) => {
  const formState = stateSubject.value;

  if (formState.password !== formState.confirmPassword) {
    alert('Passwords do not match.');
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
    alert('Please select a valid user type.');
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
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 409) {
          alert('The email or username already exists.');
        } else {
          alert(
            'Failed to sign up. Please check your information and try again.',
          );
        }
      } else if (error.request) {
        alert('No response from server. Please try again later.');
        console.error('Error request:', error.request);
      } else {
        alert('Unexpected error occurred. Please try again.');
        console.error('Error message:', error.message);
      }
    } else {
      alert('Unexpected error occurred. Please try again.');
      console.error('Unexpected error:', error);
    }

    setShowErrorDialog(true);
  }
};

export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());
