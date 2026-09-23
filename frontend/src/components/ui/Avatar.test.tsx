// src/components/ui/Avatar.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('muestra las iniciales de las dos primeras palabras del nombre', () => {
    render(<Avatar name="Carla Gómez" />);
    expect(screen.getByText('CG')).toBeInTheDocument();
  });

  it('ignora palabras extra al calcular iniciales', () => {
    render(<Avatar name="Juan Pablo Pérez" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('usa el nombre como aria-label accesible', () => {
    render(<Avatar name="Lucas Fernández" />);
    expect(screen.getByLabelText('Lucas Fernández')).toBeInTheDocument();
  });

  it('renderiza una imagen cuando se pasa src, en vez de las iniciales', () => {
    render(<Avatar name="Carla Gómez" src="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img', { name: 'Carla Gómez' });
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(screen.queryByText('CG')).not.toBeInTheDocument();
  });

  it('asigna la misma paleta de forma determinística para el mismo nombre', () => {
    const { container: c1 } = render(<Avatar name="Carla Gómez" />);
    const { container: c2 } = render(<Avatar name="Carla Gómez" />);
    // Comparamos la clase completa (incluye la paleta) entre dos renders independientes
    expect(c1.firstElementChild?.className).toBe(c2.firstElementChild?.className);
  });
});