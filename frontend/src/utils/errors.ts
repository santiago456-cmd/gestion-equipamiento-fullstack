// src/utils/errors.ts
import type { ApiError } from '../types/api';

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as ApiError).message === 'string'
  );
}

export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  if (isApiError(err)) return err.message;
  return fallback;
}