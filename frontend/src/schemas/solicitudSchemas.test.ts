// src/schemas/solicitudSchemas.test.ts
import { describe, expect, it } from 'vitest';
import { nuevaSolicitudSchema, editarSolicitudSchema, rechazoSchema } from './solicitudSchemas';

describe('nuevaSolicitudSchema', () => {
  const base = {
    equipoId: '10',
    fechaRetiro: '2026-09-01',
    fechaDevolucion: '2026-09-05',
    motivo: 'Motivo con más de diez caracteres',
  };

  it('acepta datos válidos', () => {
    expect(nuevaSolicitudSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza cuando fechaDevolucion es anterior a fechaRetiro', () => {
    const result = nuevaSolicitudSchema.safeParse({
      ...base,
      fechaRetiro: '2026-09-10',
      fechaDevolucion: '2026-09-05',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['fechaDevolucion']);
    }
  });

  it('rechaza motivo con menos de 10 caracteres', () => {
    const result = nuevaSolicitudSchema.safeParse({ ...base, motivo: 'corto' });
    expect(result.success).toBe(false);
  });

  it('rechaza si no se selecciona equipo', () => {
    const result = nuevaSolicitudSchema.safeParse({ ...base, equipoId: '' });
    expect(result.success).toBe(false);
  });
});

describe('editarSolicitudSchema', () => {
  it('rechaza cuando fechaDevolucion es anterior a fechaRetiro', () => {
    const result = editarSolicitudSchema.safeParse({
      fechaRetiro: '2026-09-10',
      fechaDevolucion: '2026-09-01',
      motivo: 'Algo',
    });
    expect(result.success).toBe(false);
  });
});

describe('rechazoSchema', () => {
  it('rechaza motivo vacío', () => {
    expect(rechazoSchema.safeParse({ rejectMotivo: '' }).success).toBe(false);
  });

  it('acepta un motivo no vacío', () => {
    expect(rechazoSchema.safeParse({ rejectMotivo: 'No cumple los requisitos' }).success).toBe(true);
  });
});