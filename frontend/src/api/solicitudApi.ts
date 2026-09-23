// src/api/solicitudApi.ts
import { api } from './axiosClient';
import type { Solicitud, HistorialRow, ResumenDashboard } from '../types/solicitud';
import type { ApiListResponse, ApiItemResponse } from '../types/api';

export interface ListarSolicitudesParams {
  estado?: string;
  equipoId?: string | number;
  categoria?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
}

export interface CrearSolicitudPayload {
  equipoId: number;
  fechaRetiro: string;
  fechaDevolucion: string;
  motivo: string;
}

export interface EditarSolicitudPayload {
  fechaRetiro: string;
  fechaDevolucion: string;
  motivo: string;
}

export const solicitudApi = {
  // GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=&page=&limit=
  listarPaginado: (params: ListarSolicitudesParams = {}): Promise<ApiListResponse<Solicitud>> =>
    api
      .get<ApiListResponse<Solicitud>>('/solicitudes', { params })
      .then((res) => res.data),

  // GET /api/solicitudes/:id
  obtenerDetalle: (id: string | number): Promise<ApiItemResponse<Solicitud>> =>
    api
      .get<ApiItemResponse<Solicitud>>(`/solicitudes/${id}`)
      .then((res) => res.data),

  // POST /api/solicitudes
  crear: (data: CrearSolicitudPayload): Promise<ApiItemResponse<Solicitud>> =>
    api
      .post<ApiItemResponse<Solicitud>>('/solicitudes', data)
      .then((res) => res.data),

  // PUT /api/solicitudes/:id
  editar: (id: string | number, data: EditarSolicitudPayload): Promise<ApiItemResponse<Solicitud>> =>
    api
      .put<ApiItemResponse<Solicitud>>(`/solicitudes/${id}`, data)
      .then((res) => res.data),

  // PATCH /api/solicitudes/:id/aprobar
  aprobar: (id: string | number): Promise<ApiItemResponse<Solicitud>> =>
    api
      .patch<ApiItemResponse<Solicitud>>(`/solicitudes/${id}/aprobar`)
      .then((res) => res.data),

  // PATCH /api/solicitudes/:id/rechazar
  rechazar: (id: string | number): Promise<ApiItemResponse<Solicitud>> =>
    api
      .patch<ApiItemResponse<Solicitud>>(`/solicitudes/${id}/rechazar`)
      .then((res) => res.data),

  // PATCH /api/solicitudes/:id/cancelar
  cancelar: (id: string | number): Promise<ApiItemResponse<Solicitud>> =>
    api
      .patch<ApiItemResponse<Solicitud>>(`/solicitudes/${id}/cancelar`)
      .then((res) => res.data),

  // PATCH /api/solicitudes/:id/devolver
  devolver: (id: string | number): Promise<ApiItemResponse<Solicitud>> =>
    api
      .patch<ApiItemResponse<Solicitud>>(`/solicitudes/${id}/devolver`)
      .then((res) => res.data),

  // GET /api/solicitudes/dashboard/resumen
  obtenerResumen: (): Promise<ApiItemResponse<ResumenDashboard>> =>
    api
      .get<ApiItemResponse<ResumenDashboard>>('/solicitudes/dashboard/resumen')
      .then((res) => res.data),

  // GET /api/solicitudes/:id/historial
  obtenerHistorial: (id: string | number): Promise<ApiItemResponse<HistorialRow[]>> =>
    api
      .get<ApiItemResponse<HistorialRow[]>>(`/solicitudes/${id}/historial`)
      .then((res) => res.data),
};