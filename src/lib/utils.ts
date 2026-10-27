import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FdrRecord, UserSession } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number, compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
  }

  // Standard Indian comma separator
  const str = Math.round(amount).toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `₹${res}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getMaturityBadgeStyle(status: string) {
  switch (status) {
    case 'EXPIRING_7':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500 animate-pulse',
        label: 'Matures in ≤7 Days'
      };
    case 'EXPIRING_30':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        label: 'Matures in ≤30 Days'
      };
    case 'EXPIRING_60':
      return {
        bg: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
        dot: 'bg-yellow-500',
        label: 'Matures in ≤60 Days'
      };
    case 'EXPIRING_90':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500',
        label: 'Matures in ≤90 Days'
      };
    case 'MATURED':
      return {
        bg: 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700',
        dot: 'bg-red-600',
        label: 'Matured (Overdue)'
      };
    case 'HEALTHY':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        label: 'Active & Compliant'
      };
  }
}

export function getLifecycleBadgeStyle(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'UNDER_VERIFICATION':
      return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300';
    case 'CORRECTION_REQUIRED':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300';
    case 'MATURED_NEEDS_REVIEW':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
    case 'RENEWAL_IN_PROGRESS':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300';
    case 'RELEASE_REQUESTED':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300';
    case 'RELEASED':
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300';
    case 'SUBMITTED':
    case 'DRAFT':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
  }
}

export function filterFdrsByPermission(fdrs: FdrRecord[], currentUser: UserSession): FdrRecord[] {
  if (currentUser.role === 'INSTITUTION_ADMIN' || currentUser.role === 'INSTITUTION_OPERATOR') {
    return fdrs.filter(f => f.institutionId === currentUser.institutionId);
  }
  return fdrs;
}
