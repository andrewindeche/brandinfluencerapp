import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import axiosInstance from './axiosInstance';
import { debounce } from 'lodash';

type FormState = {
  confirmPassword: any;
  email: string;
  userType: 'brand' | 'influencer' | 'unknown';
  name: string;
  username: string;
  password: string;
  category?: string;
  bio?: string;
  location?: string;
};

export const initialState: FormState = {
  email: '',
  userType: 'unknown',
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
  try {
    if (!email) {
      stateSubject.next({ ...stateSubject.value, userType: 'unknown' });
      return;
    }

    const response = await axiosInstance.get(`/users/user-type?email=${email}`);
    const userType = response.data.type;
    stateSubject.next({ ...stateSubject.value, userType });
  } catch (error) {
    console.error('Error fetching user type:', error);
    stateSubject.next({ ...stateSubject.value, userType: 'unknown' });
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
  setShowErrorDialog: unknown,
) => {
  const formState = stateSubject.value;

  const signUpData = {
    email: formState.email,
    userType: formState.userType,
    name: formState.name,
    username: formState.username,
    password: formState.password,
    confirmPassword: formState.confirmPassword,
    category: formState.category,
    bio: formState.bio,
    location: formState.location,
  };

  const apiEndpoint =
    formState.userType === 'influencer'
      ? 'http://localhost:4000/auth/influencer/register'
      : 'http://localhost:4000/auth/brand/register';

  try {
    const response = await axiosInstance.post(apiEndpoint, signUpData);
    console.log('Sign up successful:', response.data);
    stateSubject.next(initialState);
    navigateToLogin();
  } catch (error) {
    console.error('Error during sign-up:', error);
  }
};

export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());
