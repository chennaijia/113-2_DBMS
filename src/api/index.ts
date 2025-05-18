import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true,                     // 讓 cookie / JWT 可以一起送
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token'); // 登入後把 token 存這
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
