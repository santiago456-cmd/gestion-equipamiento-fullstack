// src/components/ui/Avatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Initials: Story = { args: { name: 'Carla Gómez', size: 'md' } };

export const WithImage: Story = {
  args: { name: 'Lucas Fernández', src: 'https://i.pravatar.cc/150?img=12' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} name="Carla Gómez" size={size} />
      ))}
    </div>
  ),
};

export const DifferentPalettes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      {['Carla Gómez', 'Lucas Fernández', 'Admin General', 'Zoe Martínez'].map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
};