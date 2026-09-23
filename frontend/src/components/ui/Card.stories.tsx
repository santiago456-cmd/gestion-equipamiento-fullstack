// src/components/ui/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import Card from './Card';
import Button from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: { title: 'Información General', icon: 'info', children: 'Contenido de ejemplo dentro de la card.' },
};

export const WithHeaderAction: Story = {
  args: {
    title: 'Historial de Cambios',
    icon: 'history',
    headerRight: <Button variant="ghost" size="sm">Exportar</Button>,
    children: 'Lista de movimientos...',
  },
};

export const Danger: Story = {
  args: { title: 'Error de Validación', icon: 'error', variant: 'danger', children: 'Algo salió mal.' },
};