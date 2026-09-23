// src/components/solicitudes/SolicitudTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import SolicitudTable from './SolicitudTable';
import { mockSolicitudes } from '../../test/handlers';

const meta: Meta<typeof SolicitudTable> = {
  title: 'Solicitudes/SolicitudTable',
  component: SolicitudTable,
  tags: ['autodocs'],
  args: { onPageChange: fn() },
};
export default meta;

type Story = StoryObj<typeof SolicitudTable>;

export const Loading: Story = {
  args: { rows: [], isLoading: true, currentPage: 1, totalPages: 1, totalResults: 0, pageSize: 5 },
};

export const Empty: Story = {
  args: { rows: [], isLoading: false, currentPage: 1, totalPages: 1, totalResults: 0, pageSize: 5 },
};

export const WithError: Story = {
  args: {
    rows: [],
    isLoading: false,
    error: 'No se pudieron cargar las solicitudes.',
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    pageSize: 5,
  },
};

export const WithData: Story = {
  args: {
    rows: mockSolicitudes,
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
    totalResults: mockSolicitudes.length,
    pageSize: 5,
  },
};