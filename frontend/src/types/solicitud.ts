// types/solicitud.ts
import type { SolicitudStatus } from '../components/ui/StatusBadge';

export interface Usuario {
  id?: number | string;
  nombre: string;
  email?: string;
  rol?: string;
}

export interface Equipo {
  id?: number | string;
  nombre: string;
  categoria?: string;
  codigoInventario?: string;
  requiereAutorizacion?: boolean;
}

export interface Solicitud {
  id: number | string;
  estado: SolicitudStatus;
  equipoId?: number | string;
  solicitante?: Usuario;
  equipo?: Equipo;
  fechaRetiro?: string;
  fechaDevolucion?: string;
  autorizador?: Usuario;
  motivo?: string;
}

export interface HistorialRow {
  id: number | string;
  fechaHora?: string;
  usuario?: Usuario;
  operador?: Usuario;
  accion: string;
  valorAnterior?: string;
  valorNuevo?: string;
}

export interface CategoriaCount {
  categoria: string;
  total: number;
}

export interface ResumenDashboard {
  pendientes: number;
  aprobadas: number;
  vencidas: number;
  equiposDisponibles: number;
  equiposPorCategoria?: CategoriaCount[];
  solicitudesRecientes?: Solicitud[];
}