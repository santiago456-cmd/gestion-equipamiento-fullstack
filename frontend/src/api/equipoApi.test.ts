// src/api/equipoApi.test.ts
import { describe, expect, it } from 'vitest';
import { equipoApi } from './equipoApi';

describe('equipoApi', () => {
  it('listar devuelve el array de equipos', async () => {
    const equipos = await equipoApi.listar();
    expect(equipos).toHaveLength(2);
    expect(equipos[0].nombre).toBe('Notebook Dell');
  });

  it('listar acepta un filtro de categoría', async () => {
    const equipos = await equipoApi.listar({ categoria: 'Presentaciones' });
    // El handler mock no filtra server-side, pero confirmamos que la llamada no rompe
    expect(Array.isArray(equipos)).toBe(true);
  });
});