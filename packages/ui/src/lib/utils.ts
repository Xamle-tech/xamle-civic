import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PolicyStatus } from '@xamle/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: PolicyStatus): string {
  const map: Record<PolicyStatus, string> = {
    [PolicyStatus.NOT_STARTED]: 'bg-gray-100 text-gray-700 border-gray-200',
    [PolicyStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PolicyStatus.DELAYED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [PolicyStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
    [PolicyStatus.ABANDONED]: 'bg-red-100 text-red-700 border-red-200',
    [PolicyStatus.REFORMULATED]: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function statusDot(status: PolicyStatus): string {
  const map: Record<PolicyStatus, string> = {
    [PolicyStatus.NOT_STARTED]: 'bg-gray-400',
    [PolicyStatus.IN_PROGRESS]: 'bg-blue-500',
    [PolicyStatus.DELAYED]: 'bg-amber-500',
    [PolicyStatus.COMPLETED]: 'bg-green-500',
    [PolicyStatus.ABANDONED]: 'bg-red-500',
    [PolicyStatus.REFORMULATED]: 'bg-purple-500',
  };
  return map[status] ?? 'bg-gray-400';
}

export function formatCurrency(amount: number, locale = 'fr-SN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDate(dateString: string, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function computeProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function truncate(str: string, maxLen = 120): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
