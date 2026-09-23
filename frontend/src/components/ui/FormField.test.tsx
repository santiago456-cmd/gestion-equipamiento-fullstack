// src/components/ui/FormField.test.tsx
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from './FormField';

describe('FormField', () => {
  it('renderiza un input de texto por defecto', () => {
    render(<FormField label="Nombre" name="nombre" />);
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('type', 'text');
  });

  it('renderiza un textarea cuando type="textarea"', () => {
    render(<FormField label="Motivo" name="motivo" type="textarea" rows={6} />);
    const textarea = screen.getByLabelText('Motivo');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('renderiza un select con sus opciones cuando type="select"', () => {
    render(
      <FormField label="Estado" name="estado" type="select">
        <option value="pendiente">Pendiente</option>
        <option value="aprobada">Aprobada</option>
      </FormField>,
    );
    const select = screen.getByLabelText('Estado');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Aprobada' })).toBeInTheDocument();
  });

  it('muestra el mensaje de error y marca aria-invalid', () => {
    render(<FormField label="Email" name="email" error="Correo inválido" />);
    expect(screen.getByText('Correo inválido')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra el indicador "Requerido" cuando required es true', () => {
    render(<FormField label="Motivo" name="motivo" required />);
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('propaga el valor escrito vía onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<FormField label="Categoría" name="categoria" value="" onChange={handleChange} />);

    await user.type(screen.getByLabelText('Categoría'), 'Laptops');

    expect(handleChange).toHaveBeenCalled();
  });

  it('reenvía el ref al elemento nativo subyacente (input)', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FormField label="Nombre" name="nombre" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('reenvía el ref al elemento nativo subyacente (textarea)', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<FormField label="Motivo" name="motivo" type="textarea" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});