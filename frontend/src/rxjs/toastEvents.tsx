import { BehaviorSubject } from 'rxjs';

export interface ToastEvent {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
}

const toastEvent$ = new BehaviorSubject<ToastEvent | null>(null);

export const showGlobalToast = (event: ToastEvent) => {
  toastEvent$.next(event);
  setTimeout(() => toastEvent$.next(null), event.duration || 8000);
};

export const toastEvents$ = toastEvent$.asObservable();