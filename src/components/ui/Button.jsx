import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-governance-800 text-white hover:bg-governance-900 shadow-card',
  saffron: 'bg-saffron-500 text-white hover:bg-saffron-600 shadow-card',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-card',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-card',
  link: 'text-governance-700 underline-offset-4 hover:underline p-0 h-auto',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
};

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
