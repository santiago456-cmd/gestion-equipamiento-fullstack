// src/api/solicitudApi.js
import { api } from './axiosClient';

export const solicitudApi = {
  // GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=&page=&limit=
  listarPaginado: (params = {}) =>
    api.get('/solicitudes', { params }).then((res) => res.data),

  // GET /api/solicitudes/:id
  obtenerDetalle: (id) =>
    api.get(`/solicitudes/${id}`).then((res) => res.data),

  // POST /api/solicitudes
  crear: (data) =>
    api.post('/solicitudes', data).then((res) => res.data),

  // PUT /api/solicitudes/:id
  editar: (id, data) =>
    api.put(`/solicitudes/${id}`, data).then((res) => res.data),

  // PATCH /api/solicitudes/:id/aprobar
  aprobar: (id) =>
    api.patch(`/solicitudes/${id}/aprobar`).then((res) => res.data),

  // PATCH /api/solicitudes/:id/rechazar
  rechazar: (id) =>
    api.patch(`/solicitudes/${id}/rechazar`).then((res) => res.data),

  // PATCH /api/solicitudes/:id/cancelar
  cancelar: (id) =>
    api.patch(`/solicitudes/${id}/cancelar`).then((res) => res.data),

  // PATCH /api/solicitudes/:id/devolver
  devolver: (id) =>
    api.patch(`/solicitudes/${id}/devolver`).then((res) => res.data),

  // GET /api/solicitudes/dashboard/resumen
  obtenerResumen: () =>
    api.get('/solicitudes/dashboard/resumen').then((res) => res.data),

  // GET /api/solicitudes/:id/historial
  obtenerHistorial: (id) =>
    api.get(`/solicitudes/${id}/historial`).then((res) => res.data),
};
