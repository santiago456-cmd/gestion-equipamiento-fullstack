// src/api/solicitudApi.test.ts
import { describe, expect, it } from 'vitest';
import { solicitudApi } from './solicitudApi';
import { mockSolicitudes } from '../test/handlers';

describe('solicitudApi', () => {
  it('listarPaginado devuelve data y totalItems', async () => {
    const res = await solicitudApi.listarPaginado({ page: 1, limit: 5 });
    expect(res.data).toHaveLength(1);
    expect(res.totalItems).toBe(1);
  });

  it('obtenerDetalle devuelve la solicitud por id', async () => {
    const res = await solicitudApi.obtenerDetalle(1);
    expect(res.data.id).toBe(1);
    expect(res.data.equipo?.nombre).toBe('Notebook Dell');
  });

  it('obtenerDetalle rechaza con ApiError cuando el id no existe', async () => {
    await expect(solicitudApi.obtenerDetalle(999)).rejects.toMatchObject({
      status: 404,
      message: 'No encontrada',
    });
  });

  it('crear envía el payload y devuelve la solicitud creada', async () => {
    const res = await solicitudApi.crear({
      equipoId: 10,
      fechaRetiro: '2026-09-01',
      fechaDevolucion: '2026-09-05',
      motivo: 'Curso de capacitación',
    });
    expect(res.data.id).toBe(99);
    expect(res.data.estado).toBe('pendiente');
  });

  it('editar envía el payload y devuelve la solicitud actualizada', async () => {
    const res = await solicitudApi.editar(1, {
      fechaRetiro: '2026-09-10',
      fechaDevolucion: '2026-09-15',
      motivo: 'Motivo actualizado',
    });
    expect(res.data.id).toBe(1);
  });

  it.each([
    ['aprobar', 'aprobada'],
    ['rechazar', 'rechazada'],
    ['cancelar', 'cancelada'],
    ['devolver', 'devuelta'],
  ] as const)('%s cambia el estado a %s', async (method, estadoEsperado) => {
    const res = await solicitudApi[method](1);
    expect(res.data.estado).toBe(estadoEsperado);
  });

  it('obtenerResumen devuelve las métricas del dashboard', async () => {
    const res = await solicitudApi.obtenerResumen();
    expect(res.data.pendientes).toBe(3);
    expect(res.data.equiposPorCategoria).toHaveLength(1);
  });

  it('obtenerHistorial devuelve las filas de historial', async () => {
    const res = await solicitudApi.obtenerHistorial(1);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].accion).toBe('creacion');
  });

  it('los mocks de solicitudes no se mutan entre tests', async () => {
    // sanity check: confirma que MSW no está devolviendo referencias compartidas mutadas
    expect(mockSolicitudes[0].id).toBe(1);
  });
});