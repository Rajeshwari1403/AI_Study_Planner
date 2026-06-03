import axios from 'axios';
import { BASE_URL } from './apiPath';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json', 
    'Content-Type': 'application/json'
  },
});

// Request Intercepter
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Intercepter
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
    if (error.response.status === 500) {
      console.error('Server error. Please try again later.');
    }
  } else if (error.code === 'ECONNABORTED') {
    console.error('Request timed out. Please check your internet connection and try again.');
  } 
  return Promise.reject(error);
}
);

export default axiosInstance;