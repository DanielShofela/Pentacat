import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none';

  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 shadow-xs border border-slate-900',
    gold: 'bg-[#C5A059] text-white hover:bg-[#B38F46] shadow-xs border border-[#B38F46]/30',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200/60',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
  };

  const sizes = {
    sm: 'text-xs py-1.5 px-3 gap-1.5',
    md: 'text-xs sm:text-sm py-2.5 px-4 gap-2',
    lg: 'text-sm sm:text-base py-3 px-6 gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
