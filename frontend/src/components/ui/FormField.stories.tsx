// src/components/ui/FormField.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import FormField from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const TextInput: Story = {
  args: { label: 'Nombre Completo', name: 'nombre', icon: 'person', placeholder: 'Ej. Juan Pérez' },
};

export const WithError: Story = {
  args: {
    label: 'Correo Electrónico',
    name: 'email',
    type: 'email',
    icon: 'mail',
    error: 'Ingresa un correo válido',
  },
};

export const Required: Story = {
  args: { label: 'Motivo', name: 'motivo', required: true, type: 'textarea', rows: 4 },
};

export const Select: Story = {
  render: (args) => (
    <FormField {...args}>
      <option value="">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="aprobada">Aprobada</option>
    </FormField>
  ),
  args: { label: 'Estado', name: 'estado', type: 'select' },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <FormField
        label="Categoría"
        name="categoria"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ej. Laptops"
      />
    );
  },
};