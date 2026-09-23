// src/utils/errors.test.ts
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('devuelve el mensaje de un Error real', () => {
    expect(getErrorMessage(new Error('Credenciales inválidas'))).toBe('Credenciales inválidas');
  });

  it('devuelve el string directamente si err es un string', () => {
    expect(getErrorMessage('algo salió mal')).toBe('algo salió mal');
  });

  it('devuelve el fallback si err no es reconocible', () => {
    expect(getErrorMessage({ codigo: 500 })).toBe('Ocurrió un error inesperado.');
  });

  it('respeta un fallback personalizado', () => {
    expect(getErrorMessage(null, 'No se pudo cargar.')).toBe('No se pudo cargar.');
  });
});