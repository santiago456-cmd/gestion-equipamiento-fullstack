// components/ui/Pagination.tsx
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

type PageEntry = number | '...';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  pageSize = 5,
  onPageChange,
}: PaginationProps) {
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalResults);

  const buildPages = (): PageEntry[] => {
    const pages: PageEntry[] = [];
    const range = new Set(
      [1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    );
    const sorted = [...range].sort((a, b) => a - b);

    sorted.forEach((page, i) => {
      if (i > 0 && page - sorted[i - 1] > 1) pages.push('...');
      pages.push(page);
    });
    return pages;
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.info}>
        Mostrando {start}–{end} de {totalResults} resultados
      </span>

      <div className={styles.controls}>
        <button
          className={styles.arrowButton}
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            chevron_left
          </span>
        </button>

        {buildPages().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </button>
          ),
        )}

        <button
          className={styles.arrowButton}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}