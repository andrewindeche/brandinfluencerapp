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
  _setShowErrorDialog: (show: boolean) => void,
  setErrors: (errors: Record<string, string>) => void,
  showToast: (message: string, type?: 'success' | 'error') => void,
) => {
  const formState = stateSubject.value;

  if (formState.password !== formState.confirmPassword) {
    setErrors({ confirmPassword: 'Passwords do not match.' });
    return;
  }

  if (formState.role === 'unknown') {
    setErrors({ role: 'Please select a valid user type.' });
    return;
  }
  try {
    stateSubject.next(initialState);
    showToast('Registration successful', 'success');
    navigateToLogin();
  } catch (error: unknown) {
    stateSubject.next(initialState);
    if (error instanceof AxiosError && error.response) {
      const { status, data } = error.response;

      if (status === 409 && data?.code === 'DUPLICATE_USER') {
        setErrors({ email: data.message, username: data.message });
        showToast(data.message, 'error');
      } else if (typeof data === 'object' && data?.message) {
        showToast(data.message, 'error');
      } else {
        showToast('Unexpected error occurred.', 'error');
      }
    } else {
      showToast('Unexpected error occurred.', 'error');
    }
  }
};

export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());
