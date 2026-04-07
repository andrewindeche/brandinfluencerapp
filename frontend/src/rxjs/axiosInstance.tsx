import axios, { AxiosError, AxiosResponse } from 'axios';
import { ErrorResponse } from '../interfaces';
import { showGlobalToast } from './toastEvents';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {},
  withCredentials: true,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

let isLoggingOut = false;

export const forceLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  localStorage.clear();
  sessionStorage.removeItem('toastMessage');
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  setAuthToken(null);
  showGlobalToast({ message: 'Session expired. Please log in again.', type: 'warning' });
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const get401Message = (data: any): { message: string; code: string } => {
  const errorData = data?.message;
  const isObject = typeof errorData === 'object' && errorData !== null;
  
  if (isObject) {
    const msg = (errorData as any)?.message?.toLowerCase() || '';
    const code = (errorData as any)?.code || '';
    
    if (code === 'USER_NOT_FOUND' || msg.includes('not found')) {
      return { message: 'No account found with this email address.', code: 'USER_NOT_FOUND' };
    }
    if (code === 'ROLE_MISMATCH' || msg.includes('role')) {
      return { message: `No account found with this email for this account type. Try switching your account type.`, code: 'ROLE_MISMATCH' };
    }
    if (code === 'INVALID_PASSWORD' || msg.includes('password')) {
      return { message: 'Incorrect password. Please try again.', code: 'INVALID_PASSWORD' };
    }
    return { message: errorData.message || 'Invalid email or password. Please try again.', code: code || 'INVALID_CREDENTIALS' };
  }
  
  const msg = (data?.message || '').toLowerCase();
  if (msg.includes('expired')) {
    return { message: 'Your session has expired. Please log in again.', code: 'TOKEN_EXPIRED' };
  }
  return { message: 'Invalid email or password. Please try again.', code: 'UNAUTHORIZED' };
};

const get500Message = (data: any): { message: string; code: string } => {
  const msg = (data?.message || '').toLowerCase();
  if (msg.includes('database') || msg.includes('mongo') || msg.includes('connection')) {
    return { message: 'Unable to connect to the database. Please try again later.', code: 'DB_CONNECTION_ERROR' };
  }
  return { message: data?.message || 'Server error. Please try again later.', code: 'SERVER_ERROR' };
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    const { data, status } = error.response || { data: null, status: 0 };
    let result = { message: 'An unexpected error occurred.', code: 'UNKNOWN_ERROR' };

    if (status === 401) {
      result = get401Message(data);
      if (result.code === 'TOKEN_EXPIRED') {
        showGlobalToast({ message: result.message, type: 'error', duration: 10000 });
        forceLogout();
        return Promise.reject({ message: result.message, code: result.code, statusCode: 401 });
      }
    } else if (status === 500) {
      result = get500Message(data);
    } else if (status === 503) {
      showGlobalToast({ message: 'Service temporarily unavailable. Please try again later.', type: 'error', duration: 10000 });
      result = { message: 'Service temporarily unavailable.', code: 'SERVICE_UNAVAILABLE' };
    } else if (status === 0 || status === -1) {
      showGlobalToast({ message: 'Unable to connect to the server. Please check your internet connection.', type: 'error', duration: 10000 });
      result = { message: 'Network error. Please check your connection and try again.', code: 'NETWORK_ERROR' };
    }

    return Promise.reject({ message: result.message, code: result.code, statusCode: status, raw: data });
  }
);

export default axiosInstance;
