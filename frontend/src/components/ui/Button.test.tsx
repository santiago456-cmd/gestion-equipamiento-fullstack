// src/components/ui/Button.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renderiza el texto del children', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('llama a onClick al hacer click', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Aprobar</Button>);

    await user.click(screen.getByRole('button', { name: 'Aprobar' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no dispara onClick cuando está disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Rechazar
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Rechazar' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('aplica la clase del variant correspondiente', () => {
    render(<Button variant="danger">Cancelar</Button>);
    expect(screen.getByRole('button', { name: 'Cancelar' }).className).toMatch(/danger/);
  });
});