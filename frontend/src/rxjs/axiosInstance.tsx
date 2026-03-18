import axios, { AxiosError, AxiosResponse } from 'axios';
import { ErrorResponse } from '../interfaces';

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

      if (typeof data === 'object' && data !== null) {
        message =
          (data as any)?.message ||
          (data as any)?.error ||
          'An unexpected error occurred.';
      } else if (typeof data === 'string') {
        message = data;
      }

      return Promise.reject({
        message,
        code: (data as any)?.code || 'UNKNOWN_ERROR',
        statusCode: status,
        raw: data,
      });
    }

    return Promise.reject({
      message: 'Network error. Please try again later.',
      code: 'NETWORK_ERROR',
    });
  },
);

export default axiosInstance;
