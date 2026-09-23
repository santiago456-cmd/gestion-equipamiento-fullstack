// src/components/ui/Pagination.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('muestra el rango de resultados correctamente', () => {
    render(
      <Pagination currentPage={2} totalPages={3} totalResults={13} pageSize={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText(/Mostrando 6–10 de 13 resultados/)).toBeInTheDocument();
  });

  it('deshabilita "anterior" en la primera página y "siguiente" en la última', () => {
    render(
      <Pagination currentPage={1} totalPages={1} totalResults={3} pageSize={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled();
  });

  it('llama a onPageChange con la página correcta al hacer click en un número', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        totalResults={25}
        pageSize={5}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: '4' }));

    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('llama a onPageChange al avanzar con la flecha "siguiente"', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalResults={25}
        pageSize={5}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(screen.getByLabelText('Página siguiente'));

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('muestra elipsis cuando hay páginas intermedias no adyacentes', () => {
    render(
      <Pagination currentPage={1} totalPages={10} totalResults={50} pageSize={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText('…')).toBeInTheDocument();
  });
});