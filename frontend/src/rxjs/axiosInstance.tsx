import axios, { AxiosError, AxiosResponse } from 'axios';

interface ErrorResponse {
  code: string;
  message: string;
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      let errorMessage = 'An unexpected error occurred.';
      let errorCode = 'UNKNOWN_ERROR';

      if (status === 409 && data?.code === 'DUPLICATE_USER') {
        errorMessage = 'Username or email already exists.';
        errorCode = 'DUPLICATE_USER';
      } else {
        errorMessage = data?.message || errorMessage;
        errorCode = data?.code || errorCode;
      }

      return Promise.reject({
        message: errorMessage,
        code: errorCode,
      });
    }

    return Promise.reject({
      message: 'Network error. Please try again later.',
      code: 'NETWORK_ERROR',
    });
  },
);

export default axiosInstance;
