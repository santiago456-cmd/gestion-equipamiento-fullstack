// src/components/ui/StatusBadge.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('muestra la etiqueta correspondiente al estado', () => {
    render(<StatusBadge status="aprobada" />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('cae en "Pendiente" si el estado no está mapeado', () => {
    // @ts-expect-error — probamos deliberadamente un valor fuera del union
    render(<StatusBadge status="inexistente" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('oculta el ícono cuando showIcon es false', () => {
    render(<StatusBadge status="rechazada" showIcon={false} />);
    expect(screen.queryByText('cancel')).not.toBeInTheDocument();
  });
});