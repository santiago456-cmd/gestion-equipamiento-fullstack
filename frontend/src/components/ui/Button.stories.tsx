// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'neutral'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Guardar', variant: 'primary' },
};

export const Danger: Story = {
  args: { children: 'Cancelar Solicitud', variant: 'danger', icon: 'block' },
};

export const WithIconAfter: Story = {
  args: { children: 'Iniciar Sesión', iconAfter: 'arrow_forward' },
};

export const FullWidth: Story = {
  args: { children: 'Crear Cuenta', fullWidth: true, icon: 'person_add' },
  parameters: { layout: 'padded' },
};

export const Disabled: Story = {
  args: { children: 'Enviando...', disabled: true },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="danger">Danger</Button>
      <Button {...args} variant="neutral">Neutral</Button>
    </div>
  ),
};