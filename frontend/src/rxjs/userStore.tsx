import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export type User = {
  username: string;
  name: string;
  email: string;
  role: 'brand' | 'influencer' | 'admin';
};

const userSubject = new BehaviorSubject<User | null>(null);

export const setUser = (user: User) => {
  userSubject.next(user);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearUser = () => {
  userSubject.next(null);
  localStorage.removeItem('user');
};

export const getUser = (): User | null => userSubject.value;

if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    userSubject.next(JSON.parse(savedUser));
  }
}

export const user$ = userSubject.asObservable().pipe(distinctUntilChanged());
