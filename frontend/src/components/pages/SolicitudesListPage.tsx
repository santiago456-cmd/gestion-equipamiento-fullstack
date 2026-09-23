// components/pages/SolicitudesListPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import AppShell from '../layout/AppShell';
import Button from '../ui/Button';
import SolicitudFilters from '../solicitudes/SolicitudFilters';
import type { SolicitudFiltersState } from '../solicitudes/SolicitudFilters';
import SolicitudTable from '../solicitudes/SolicitudTable';
import { solicitudApi } from '../../api/solicitudApi';
import type { Solicitud } from '../../types/solicitud';
import { getErrorMessage } from '../../utils/errors';
import styles from './SolicitudesListPage.module.css';

const PAGE_SIZE = 5;

/**
 * SolicitudesListPage — orquesta filtros + tabla paginada de solicitudes.
 * Conectado a GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=&page=&limit=
 */
export default function SolicitudesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<SolicitudFiltersState>({
    estado: searchParams.get('estado') ?? '',
    equipoId: searchParams.get('equipoId') ?? '',
    categoria: searchParams.get('categoria') ?? '',
    desde: searchParams.get('desde') ?? '',
    hasta: searchParams.get('hasta') ?? '',
  });

  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [rows, setRows] = useState<Solicitud[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: PAGE_SIZE };
      if (filters.estado) params.estado = filters.estado;
      if (filters.equipoId) params.equipoId = filters.equipoId;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;

      const res = await solicitudApi.listarPaginado(params);
      setRows(res.data ?? []);
      setTotalItems(res.totalItems ?? 0);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las solicitudes.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.estado, filters.equipoId, filters.categoria, filters.desde, filters.hasta]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = (key: keyof SolicitudFiltersState, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const applyFilters = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = { ...filters, page: '1' };
    const params = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== '' && v != null),
    );
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== ''),
    );
    setSearchParams({ ...params, page: String(page) });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <AppShell>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gestión de Solicitudes</h1>
          <p className={styles.pageSubtitle}>
            Administra y supervisa las asignaciones de equipo corporativo.
          </p>
        </div>
        <Button variant="primary" icon="add_box" onClick={() => navigate('/solicitudes/nueva')}>
          Nueva Solicitud
        </Button>
      </div>

      <SolicitudFilters filters={filters} onChange={setFilter} onSubmit={applyFilters} />

      <SolicitudTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </AppShell>
  );
}