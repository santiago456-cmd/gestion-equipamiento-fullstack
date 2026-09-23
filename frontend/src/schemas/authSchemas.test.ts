// src/schemas/authSchemas.test.ts
import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './authSchemas';

describe('loginSchema', () => {
  it('acepta email y password válidos', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rechaza un email con formato inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-un-email', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rechaza password vacío', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    nombre: 'Carla Gómez',
    email: 'carla@dds.com',
    password: 'abcdef',
    confirmPassword: 'abcdef',
  };

  it('acepta datos válidos con contraseñas coincidentes', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('rechaza cuando las contraseñas no coinciden', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'otraClave' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
      expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden');
    }
  });

  it('rechaza password de menos de 6 caracteres', () => {
    const result = registerSchema.safeParse({ ...base, password: '123', confirmPassword: '123' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    const result = registerSchema.safeParse({ ...base, nombre: '  ' });
    expect(result.success).toBe(false);
  });
});