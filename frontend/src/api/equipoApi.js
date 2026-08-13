// src/api/equipoApi.js
import { api } from './axiosClient';

export const equipoApi = {
  // GET /api/equipos?categoria=
  listar: (params = {}) =>
    api.get('/equipos', { params }).then((res) => res.data.data),
};
