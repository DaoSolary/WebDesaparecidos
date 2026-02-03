import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error('VITE_API_URL não definida em produção');
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bdpd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


