import React from 'react';
import { Filter, X, RotateCcw, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { Category, ProductFilterMode, ProductFilters, ProductSortOption } from '../../types';
import { Button } from '../ui/Button';

export interface CatalogFiltersProps {
  categories: Category[];
  brands: string[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onReset: () => void;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories,
  brands,
  filters,
  onChange,
  onReset,
  className = '',
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const priceRanges = [
    { label: 'Tous les prix', min: undefined, max: undefined },
    { label: 'Moins de 100 000 F', min: undefined, max: 100000 },
    { label: '100 000 F - 250 000 F', min: 100000, max: 250000 },
    { label: '250 000 F - 400 000 F', min: 250000, max: 400000 },
    { label: 'Plus de 400 000 F', min: 400000, max: undefined },
  ];

  const hasActiveFilters = Boolean(
    filters.categoryId ||
    filters.brand ||
    filters.searchQuery ||
    (filters.commercialMode && filters.commercialMode !== 'all') ||
    filters.inStockOnly ||
    filters.promotionsOnly ||
    typeof filters.minPrice === 'number' ||
    typeof filters.maxPrice === 'number'
  );

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* 1. Formule Commerciale */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-900 block">Formule d'achat</span>
        <div className="space-y-1 text-xs">
          {[
            { id: 'all', label: 'Toutes les formules' },
            { id: 'cash', label: 'Achat Comptant Direct' },
            { id: 'installment', label: 'Paiement Échelonné (Crédit)' },
            { id: 'tontine', label: 'Tontine Rotative (0%)' },
          ].map((mode) => {
            const isSelected = (filters.commercialMode || 'all') === mode.id;
            return (
              <label
                key={mode.id}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-950 bg-slate-50 text-slate-950 font-bold'
                    : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{mode.label}</span>
                <input
                  type="radio"
                  name="commercialMode"
                  checked={isSelected}
                  onChange={() => onChange({ ...filters, commercialMode: mode.id as ProductFilterMode })}
                  className="text-slate-950 focus:ring-slate-950"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Rayon / Catégorie */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-900 block">Rayons & Catégories</span>
        <div className="space-y-1 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...filters, categoryId: null })}
            className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
              !filters.categoryId
                ? 'bg-slate-100 font-bold text-slate-950'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Toutes les catégories</span>
            {!filters.categoryId && <Check className="w-3.5 h-3.5 text-slate-900" />}
          </button>

          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ ...filters, categoryId: isSelected ? null : cat.id })}
                className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-100 font-bold text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Marque */}
      {brands.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-900 block">Marques certifiées</span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {brands.map((b) => {
              const isSelected = filters.brand?.toLowerCase() === b.toLowerCase();
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => onChange({ ...filters, brand: isSelected ? null : b })}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tranche de Prix */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-900 block">Budget (FCFA)</span>
        <div className="space-y-1 text-xs">
          {priceRanges.map((range, idx) => {
            const isSelected = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <label
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-950 bg-slate-50 font-bold text-slate-950'
                    : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{range.label}</span>
                <input
                  type="radio"
                  name="priceRange"
                  checked={isSelected}
                  onChange={() => onChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
                  className="text-slate-950 focus:ring-slate-950"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Toggles: En stock & Promotions */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
          <span className="text-slate-800 font-medium">Disponibilité en stock</span>
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="rounded text-slate-950 focus:ring-slate-950"
          />
        </label>

        <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
          <span className="text-slate-800 font-medium">Promotions en cours</span>
          <input
            type="checkbox"
            checked={Boolean(filters.promotionsOnly)}
            onChange={(e) => onChange({ ...filters, promotionsOnly: e.target.checked })}
            className="rounded text-slate-950 focus:ring-slate-950"
          />
        </label>
      </div>

      {isMobileDrawer && (
        <div className="pt-4 border-t border-slate-100">
          <Button variant="primary" fullWidth size="md" onClick={onCloseMobile}>
            Appliquer les filtres
          </Button>
        </div>
      )}

    </div>
  );
};
