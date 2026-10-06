import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'gold' | 'blue' | 'green' | 'slate';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  children,
  className = '',
}) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    gold: 'bg-[#FBF7EE] text-[#9A7426] border-[#E8DAB7]',
    blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    slate: 'bg-slate-900 text-slate-100 border-slate-800',
  };

  const dots = {
    neutral: 'bg-slate-400',
    gold: 'bg-[#C5A059]',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    slate: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-tight ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
};
