import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

type User = {
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

export const getUser = (): User | null => {
  return userSubject.value;
};

const saved = localStorage.getItem('user');
if (saved) {
  userSubject.next(JSON.parse(saved));
}

export const user$: Observable<User | null> = userSubject
  .asObservable()
  .pipe(distinctUntilChanged());
