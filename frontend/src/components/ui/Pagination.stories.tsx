// src/components/ui/Pagination.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Pagination from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const FewPages: Story = {
  args: { currentPage: 1, totalPages: 3, totalResults: 13, pageSize: 5 },
};

export const ManyPagesWithEllipsis: Story = {
  args: { currentPage: 5, totalPages: 20, totalResults: 100, pageSize: 5 },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination currentPage={page} totalPages={10} totalResults={50} pageSize={5} onPageChange={setPage} />
    );
  },
};