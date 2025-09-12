import axios, { AxiosError, AxiosResponse } from 'axios';

interface ErrorResponse {
  code?: string;
  message?: string;
}

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

      return Promise.reject({
        message: data?.message || 'An unexpected error occurred.',
        code: data?.code || 'UNKNOWN_ERROR',
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
