import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PolicyCard } from '@/components/features/policies/PolicyCard';
import { PolicyStatus, PolicyTheme, WorkflowStatus } from '@xamle/types';

vi.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <article {...props}>{children}</article>
    ),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockPolicy = {
  id: '1',
  title: 'Programme Couverture Maladie Universelle',
  slug: 'couverture-maladie-universelle',
  description: 'Extension de la couverture maladie à toute la population sénégalaise.',
  ministryId: 'min-1',
  ministry: { id: 'min-1', name: 'Ministère de la Santé', slug: 'sante', logo: null, description: null, createdAt: '', updatedAt: '' },
  theme: PolicyTheme.HEALTH,
  status: PolicyStatus.IN_PROGRESS,
  workflowStatus: WorkflowStatus.PUBLISHED,
  budget: 85000000000,
  budgetSpent: 42000000000,
  startDate: '2023-01-01',
  endDate: '2026-12-31',
  targetKpis: [{ name: 'Couverture', target: 75, current: 48, unit: '%' }],
  region: null,
  version: 1,
  publishedAt: '2024-01-01',
  createdBy: 'user-1',
  createdAt: '2023-01-01',
  updatedAt: '2024-06-01',
  _count: { contributions: 3, comments: 12, indicators: 2 },
};

describe('PolicyCard', () => {
  it('renders the policy title', () => {
    render(<PolicyCard policy={mockPolicy} />);
    expect(screen.getByText('Programme Couverture Maladie Universelle')).toBeInTheDocument();
  });

  it('renders ministry name', () => {
    render(<PolicyCard policy={mockPolicy} />);
    expect(screen.getByText('Ministère de la Santé')).toBeInTheDocument();
  });

  it('shows comment count', () => {
    render(<PolicyCard policy={mockPolicy} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('has an accessible link to policy detail', () => {
    render(<PolicyCard policy={mockPolicy} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/policies/couverture-maladie-universelle');
  });

  it('shows progress bar for KPIs', () => {
    render(<PolicyCard policy={mockPolicy} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
