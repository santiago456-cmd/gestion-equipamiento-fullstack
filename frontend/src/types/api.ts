// types/api.ts

/** Envelope genérico para endpoints que devuelven un único recurso: { data: T } */
export interface ApiItemResponse<T> {
  data: T;
}

/** Envelope para endpoints paginados: { data: T[], totalItems, page, limit } */
export interface ApiListResponse<T> {
  data: T[];
  totalItems: number;
  page?: number;
  limit?: number;
}

/** Forma normalizada de error que arma el interceptor de axiosClient */
export interface ApiError {
  status?: number;
  message: string;
  original: unknown;
}