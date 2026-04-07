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

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request was blocked:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { data, status } = error.response;
      let message = 'An unexpected error occurred.';
      let code = 'UNKNOWN_ERROR';

      if (status === 401) {
        const errorMessage = (data as any)?.message?.toLowerCase() || '';
        const errorData = (data as any)?.message;
        const isObjectMessage = typeof errorData === 'object' && errorData !== null;
        
        if (isObjectMessage) {
          const customMessage = (errorData as any)?.message;
          const customCode = (errorData as any)?.code;
          
          if (customCode === 'USER_NOT_FOUND' || customMessage?.toLowerCase().includes('not found')) {
            message = 'No account found with this email address.';
            code = 'USER_NOT_FOUND';
          } else if (customCode === 'ROLE_MISMATCH' || customMessage?.toLowerCase().includes('role')) {
            message = `No account found with this email for this account type. Try switching your account type.`;
            code = 'ROLE_MISMATCH';
          } else if (customCode === 'INVALID_PASSWORD' || customMessage?.toLowerCase().includes('password')) {
            message = 'Incorrect password. Please try again.';
            code = 'INVALID_PASSWORD';
          } else {
            message = customMessage || 'Invalid email or password. Please try again.';
            code = customCode || 'INVALID_CREDENTIALS';
          }
        } else if (errorMessage.includes('expired') && !errorMessage.includes('password')) {
          showGlobalToast({ message: 'Your session has expired. Please log in again.', type: 'error', duration: 10000 });
          forceLogout();
          return Promise.reject({ message: 'Session expired', code: 'TOKEN_EXPIRED', statusCode: 401 });
        } else if (errorMessage.includes('unauthorized')) {
          message = 'Invalid email or password. Please try again.';
          code = 'UNAUTHORIZED';
        } else {
          message = 'Unauthorized. Please log in.';
          code = 'UNAUTHORIZED';
        }
      } else if (status === 500) {
        const errorMessage = (data as any)?.message?.toLowerCase() || '';
        if (errorMessage.includes('database') || errorMessage.includes('mongo') || errorMessage.includes('connection')) {
          message = 'Unable to connect to the database. Please try again later.';
          code = 'DB_CONNECTION_ERROR';
        } else if ((data as any)?.message) {
          message = (data as any).message;
          code = 'SERVER_ERROR';
        } else {
          message = 'Server error. Please try again later.';
          code = 'SERVER_ERROR';
        }
      } else if (status === 503) {
        showGlobalToast({ message: 'Service temporarily unavailable. Please try again later.', type: 'error', duration: 10000 });
        code = 'SERVICE_UNAVAILABLE';
      } else if (status === 0 || status === -1) {
        showGlobalToast({ message: 'Unable to connect to the server. Please check your internet connection.', type: 'error', duration: 10000 });
        code = 'NETWORK_ERROR';
      }

      if (status === 401 && message === 'Unauthorized. Please log in.') {
        message = 'Invalid email or password. Please try again.';
      }

      return Promise.reject({
        message,
        code,
        statusCode: status,
        raw: data,
      });
    }

    showGlobalToast({ message: 'Network error. Please check your connection and try again.', type: 'error', duration: 10000 });
    return Promise.reject({
      message: 'Network error. Please try again later.',
      code: 'NETWORK_ERROR',
    });
  },
);

export default axiosInstance;
