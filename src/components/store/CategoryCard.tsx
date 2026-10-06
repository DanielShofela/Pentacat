import React from 'react';
import { Category } from '../../types';

export interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-slate-950 ring-2 ring-slate-950 shadow-md scale-[1.01]'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md bg-white'
      }`}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={
            category.imageUrl ||
            'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80'
          }
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="font-bold text-sm tracking-tight leading-tight">{category.name}</h4>
          <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
            {category.itemCount || 10}+ références
          </p>
        </div>
      </div>
    </div>
  );
};
