// src/components/ui/Card.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renderiza el título y el contenido', () => {
    render(<Card title="Historial">contenido interno</Card>);
    expect(screen.getByRole('heading', { name: 'Historial' })).toBeInTheDocument();
    expect(screen.getByText('contenido interno')).toBeInTheDocument();
  });

  it('no renderiza el header si no hay título ni ícono', () => {
    render(<Card>solo contenido</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renderiza headerRight cuando se provee', () => {
    render(
      <Card title="Equipos" headerRight={<button>Exportar</button>}>
        contenido
      </Card>,
    );
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });

  it('aplica la clase de variant danger', () => {
    const { container } = render(<Card title="Error" variant="danger">contenido</Card>);
    expect(container.firstElementChild?.className).toMatch(/danger/);
  });
});