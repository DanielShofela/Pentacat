import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';

export interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyTitle = 'Aucun produit trouvé',
  emptyDescription = 'Essayez d\'ajuster vos filtres de recherche ou de catégorie.',
  onResetFilters,
  className = '',
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Réinitialiser les filtres' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
