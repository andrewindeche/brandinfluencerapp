import { authStore, initialAuthState } from '@/rxjs/authStore';
import { firstValueFrom, take } from 'rxjs';
import axiosInstance from '@/rxjs/axiosInstance';

jest.mock('@/rxjs/axiosInstance');

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('authStore', () => {
  beforeEach(() => {
    authStore.reset();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', async () => {
    const state = await firstValueFrom(authStore.state$.pipe(take(1)));
    expect(state).toEqual(initialAuthState);
  });

  it('should update email and trigger role detection debounce', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { type: 'influencer' } });

    authStore.setField('email', 'test@example.com');

    await new Promise((resolve) => setTimeout(resolve, 800));

    const state = authStore.getCurrentUser();
    expect(state.role).toBe('influencer');
    expect(state.roleDetected).toBe(true);
    expect(localStorage.getItem('userType')).toBe('influencer');
  });

  it('should handle login success', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: { role: 'influencer' } },
    });

    authStore.setField('email', 'valid@user.com');
    authStore.setField('role', 'influencer');
    authStore.updateAuthState({ roleDetected: true });

    const result = await authStore.login('valid@user.com', 'password');

    const state = authStore.getCurrentUser();
    expect(result).toEqual({ success: true, role: 'influencer' });
    expect(state.success).toBe(true);
    expect(state.submitting).toBe(false);
    expect(state.role).toBe('influencer');
  });

  it('should fail login if role is unknown', async () => {
    authStore.setField('email', 'test@fail.com');
    authStore.setField('role', 'unknown');
    authStore.updateAuthState({ roleDetected: false });

    const result = await authStore.login('test@fail.com', 'wrong');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Please wait until your role is detected');
  });

  it('should handle login API error with throttle', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 429,
        data: { message: 'Too many requests' },
      },
    });

    authStore.setField('email', 'test@throttle.com');
    authStore.setField('role', 'brand');
    authStore.updateAuthState({ roleDetected: true });

    const result = await authStore.login('test@throttle.com', 'password');

    expect(result.success).toBe(false);
    expect(result.throttle).toBe(true);

    const state = authStore.getCurrentUser();
    expect(state.errors.server).toBe('Too many requests');
  });
});
