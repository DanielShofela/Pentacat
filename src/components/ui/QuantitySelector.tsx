import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  const btnSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  };

  const textSizes = {
    sm: 'text-xs min-w-[1.5rem]',
    md: 'text-sm min-w-[2rem]',
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
      <button
        type="button"
        onClick={onDecrease}
        disabled={isMin}
        className={`${btnSizes[size]} flex items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent`}
        aria-label="Diminuer la quantité"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className={`${textSizes[size]} text-center font-semibold text-slate-800 select-none`}>
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={isMax}
        className={`${btnSizes[size]} flex items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent`}
        aria-label="Augmenter la quantité"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
