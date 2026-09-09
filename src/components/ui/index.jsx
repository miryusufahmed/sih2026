import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pt-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold text-slate-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  );
}

const badgeVariants = {
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  review: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  action: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  pending: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  info: 'bg-governance-50 text-governance-700 ring-1 ring-governance-200',
  saffron: 'bg-saffron-50 text-saffron-700 ring-1 ring-saffron-200',
};

export function Badge({ className, variant = 'info', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900',
        'placeholder:text-slate-400 focus:border-governance-500 focus:ring-2 focus:ring-governance-100',
        'transition-colors disabled:cursor-not-allowed disabled:bg-slate-50',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900',
        'focus:border-governance-500 focus:ring-2 focus:ring-governance-100 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400 focus:border-governance-500 focus:ring-2 focus:ring-governance-100',
        'transition-colors min-h-[90px]',
        className
      )}
      {...props}
    />
  );
}

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-governance-600 to-saffron-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Divider({ className }) {
  return <hr className={cn('border-slate-200', className)} />;
}
