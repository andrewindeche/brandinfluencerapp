import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 409 && data?.code === 'DUPLICATE_USER') {
        return Promise.reject({
          message: 'Username or email already exists.',
          code: 'DUPLICATE_USER',
        });
      }

      return Promise.reject({
        message: data?.message || 'An unexpected error occurred.',
        code: data?.code || 'UNKNOWN_ERROR',
      });
    }

    return Promise.reject({
      message: 'Network error. Please try again later.',
      code: 'NETWORK_ERROR',
    });
  },
);

export default axiosInstance;
