import { BehaviorSubject } from 'rxjs';

export interface AuthState {
  email: string;
  role: 'brand' | 'influencer' | 'admin' | 'unknown';
  errors: Record<string, string>;
  submitting: boolean;
  success: boolean;
  serverMessage: string | null;
}

const initialState: AuthState = {
  email: '',
  role: 'unknown',
  errors: {},
  submitting: false,
  success: false,
  serverMessage: null,
};

class AuthStore {
  private state$ = new BehaviorSubject<AuthState>(initialState);

  authState$ = this.state$.asObservable();

  getCurrentUser() {
    return this.state$.getValue();
  }

  setField<K extends keyof AuthState>(field: K, value: AuthState[K]) {
    const current = this.state$.getValue();
    this.state$.next({
      ...current,
      [field]: value,
      ...(field !== 'serverMessage' ? { serverMessage: null } : {}),
    });
  }

  setErrors(errors: Record<string, string>) {
    const current = this.state$.getValue();
    this.state$.next({
      ...current,
      errors,
      serverMessage: null,
      success: false,
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    role?: 'brand' | 'influencer' | 'admin' | 'unknown';
    message?: string;
    throttle?: boolean;
  }> {
    this.setField('submitting', true);
    this.setErrors({});
    this.setField('serverMessage', null);

    try {
      const response = await fakeApiLogin(email, password);

      if (!response.success) {
        this.setField('submitting', false);
        this.setField('success', false);
        this.setField('serverMessage', response.message || 'Login failed');
        return {
          success: false,
          message: response.message,
          throttle: response.throttle || false,
        };
      }

      this.state$.next({
        email,
        role: response.role || 'unknown',
        errors: {},
        submitting: false,
        success: true,
        serverMessage: null,
      });

      return {
        success: true,
        role: response.role,
      };
    } catch (err) {
      this.setField('submitting', false);
      this.setField('success', false);
      this.setField(
        'serverMessage',
        err instanceof Error ? err.message : 'Unknown error',
      );

      return { success: false, message: 'Network or server error' };
    }
  }
}

async function fakeApiLogin(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  role?: 'brand' | 'influencer' | 'admin';
  message?: string;
  throttle?: boolean;
}> {
  await new Promise((r) => setTimeout(r, 1000));

  if (email === 'brand@example.com' && password === 'password123') {
    return { success: true, role: 'brand' };
  }
  if (email === 'influencer@example.com' && password === 'password123') {
    return { success: true, role: 'influencer' };
  }
  if (email === 'admin@example.com' && password === 'password123') {
    return { success: true, role: 'admin' };
  }
  if (email === 'throttle@example.com') {
    return { success: false, message: 'Too many attempts', throttle: true };
  }

  return { success: false, message: 'Invalid email or password' };
}

export const authStore = new AuthStore();
export const authState$ = authStore.authState$;
