// components/solicitudes/SolicitudFilters.jsx
import type { FormEvent } from 'react';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import styles from './SolicitudFilters.module.css';

export interface SolicitudFiltersState {
  estado: string;
  equipoId: string;
  categoria: string;
  desde: string;
  hasta: string;
}

const ESTADOS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'devuelta', label: 'Devuelta' },
];

interface SolicitudFiltersProps {
  filters: SolicitudFiltersState;
  /** Actualiza un filtro individual */
  onChange: (key: keyof SolicitudFiltersState, value: string) => void;
  /** Aplica los filtros (dispara la búsqueda) */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * SolicitudFilters — formulario de filtros para el listado de solicitudes.
 * Filtra por estado, categoría, equipo y rango de fechas (params para GET /api/solicitudes).
 *
 * Props:
 *   filters    {object}   — { estado, equipoId, categoria, desde, hasta }
 *   onChange   {Function(key, value)} — actualiza un filtro individual
 *   onSubmit   {Function(event)}      — aplica los filtros (dispara la búsqueda)
 */
export default function SolicitudFilters({ filters, onChange, onSubmit }: SolicitudFiltersProps) {
  const handleChange = (key: keyof SolicitudFiltersState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement  | HTMLTextAreaElement>) => onChange(key, e.target.value);

  return (
    <form className={styles.filterCard} onSubmit={onSubmit}>
      <div className={styles.filterGrid}>
        <div className={styles.filterCol2}>
          <FormField
            id="estado"
            label="Estado"
            type="select"
            value={filters.estado}
            onChange={handleChange('estado')}
          >
            {ESTADOS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FormField>
        </div>

        <div className={styles.filterCol2}>
          <FormField
            id="equipoId"
            label="ID Equipo"
            placeholder="Ej. 4"
            value={filters.equipoId}
            onChange={handleChange('equipoId')}
          />
        </div>

        <div className={styles.filterCol2}>
          <FormField
            id="categoria"
            label="Categoría"
            placeholder="Ej. Laptops"
            value={filters.categoria}
            onChange={handleChange('categoria')}
          />
        </div>

        <div className={styles.filterDateRange}>
          <FormField id="desde" label="Desde" type="date" value={filters.desde} onChange={handleChange('desde')} />
          <FormField id="hasta" label="Hasta" type="date" value={filters.hasta} onChange={handleChange('hasta')} />
        </div>

        <div className={styles.filterCol2}>
          <Button variant="neutral" icon="filter_list" fullWidth type="submit">
            Filtrar
          </Button>
        </div>
      </div>
    </form>
  );
}
