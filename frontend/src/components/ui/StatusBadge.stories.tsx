// src/components/ui/StatusBadge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import StatusBadge from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta', 'vencido'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Pendiente: Story = { args: { status: 'pendiente' } };
export const Aprobada: Story = { args: { status: 'aprobada' } };
export const Rechazada: Story = { args: { status: 'rechazada' } };
export const Vencido: Story = { args: { status: 'vencido' } };
export const TableVariant: Story = { args: { status: 'aprobada', variant: 'table', showIcon: false } };

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta', 'vencido'] as const).map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};