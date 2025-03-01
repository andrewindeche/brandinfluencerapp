import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import axiosInstance from './axiosInstance';

type FormState = {
  email: string;
  userType: 'brand' | 'influencer' | 'unknown';
};

const initialState: FormState = {
  email: '',
  userType: 'unknown',
};

const stateSubject = new BehaviorSubject<FormState>(initialState);

const fetchUserType = async (email: string) => {
  try {
    const response = await axiosInstance.get(`/user-type?email=${email}`);
    return response.data.type;
  } catch (error) {
    console.error('Error fetching user type:', error);
    return 'unknown';
  }
};

export const setEmail = (email: string) => {
  stateSubject.next({
    ...stateSubject.value,
    email,
  });

  fetchUserType(email).then((userType) => {
    stateSubject.next({
      ...stateSubject.value,
      userType,
    });
  });
};

export const formState$: Observable<FormState> = stateSubject
  .asObservable()
  .pipe(distinctUntilChanged());
