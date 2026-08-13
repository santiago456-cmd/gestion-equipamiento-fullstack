// src/api/authApi.js
import { api } from './axiosClient';

export const authApi = {
  // POST /api/auth/register
  register: (data) => api.post('/auth/register', data).then((res) => res.data),

  // POST /api/auth/login
  login: (data) => api.post('/auth/login', data).then((res) => res.data),
};
