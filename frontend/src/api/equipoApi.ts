// src/api/equipoApi.ts
import { api } from './axiosClient';
import type { Equipo } from '../types/solicitud';
import type { ApiItemResponse } from '../types/api';

export interface ListarEquiposParams {
  categoria?: string;
}

export const equipoApi = {
  // GET /api/equipos?categoria=
  listar: (params: ListarEquiposParams = {}): Promise<Equipo[]> =>
    api
      .get<ApiItemResponse<Equipo[]>>('/equipos', { params })
      .then((res) => res.data.data),
};