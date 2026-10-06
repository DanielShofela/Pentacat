import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  X, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Product, Category, ProductFilters, ProductSortOption } from '../../types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ProductGrid } from '../store/ProductGrid';
import { CatalogFilters } from './CatalogFilters';
import { ProductSheet } from './ProductSheet';
import { Drawer } from '../ui/Drawer';
import { LoadingState } from '../ui/LoadingState';
import { useAppNavigation } from '../../context/AppNavigationContext';

const PAGE_SIZE = 8;

export const CatalogPage: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategoryId, setSelectedCategoryId } = useAppNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active full product sheet (if opened directly in catalog)
  const [selectedProductForSheet, setSelectedProductForSheet] = useState<Product | null>(null);

  // Filter & Sort State
  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: selectedCategoryId,
    brand: null,
    searchQuery: searchQuery,
    commercialMode: 'all',
    inStockOnly: false,
    promotionsOnly: false,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'featured',
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync external category or search query from navigation context
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryId: selectedCategoryId,
      searchQuery: searchQuery,
    }));
  }, [selectedCategoryId, searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, brs] = await Promise.all([
          categoryService.getCategories(),
          productService.getAvailableBrands(),
        ]);
        setCategories(cats);
        setBrands(brs);

        const prods = await productService.getProducts(filters);
        setProducts(prods);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setFilters({
      categoryId: null,
      brand: null,
      searchQuery: '',
      commercialMode: 'all',
      inStockOnly: false,
      promotionsOnly: false,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'featured',
    });
    setVisibleCount(PAGE_SIZE);
  };

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const hasMore = visibleCount < products.length;

  if (selectedProductForSheet) {
    return (
      <ProductSheet
        product={selectedProductForSheet}
        onBack={() => setSelectedProductForSheet(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 pb-24">
      
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">
          Catalogue PENTA GAD
        </span>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Équipements pour la maison ({products.length})
          </h1>
          <p className="text-xs text-slate-500">
            Tous nos produits sont garantis constructeur et disponibles immédiatement
          </p>
        </div>
      </div>

      {/* Main Grid with Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs sticky top-24">
          <CatalogFilters
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setVisibleCount(PAGE_SIZE);
            }}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Main Products Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Controls Bar: Mobile filter trigger + Sort selector */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            
            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
            </button>

            {/* Total count readout */}
            <div className="hidden sm:block text-xs text-slate-500 font-medium">
              Affichage de <span className="font-bold text-slate-900">{visibleProducts.length}</span> sur <span className="font-bold text-slate-900">{products.length}</span> articles
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Trier par :</span>
              <div className="relative">
                <select
                  value={filters.sortBy || 'featured'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as ProductSortOption })}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-950 cursor-pointer"
                >
                  <option value="featured">Sélection recommandée</option>
                  <option value="recent">Nouveautés d'abord</option>
                  <option value="price_asc">Prix croissant (FCFA)</option>
                  <option value="price_desc">Prix décroissant (FCFA)</option>
                  <option value="name_asc">Nom A - Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Active Filter Tags */}
          {(filters.categoryId || filters.brand || (filters.commercialMode && filters.commercialMode !== 'all') || filters.inStockOnly || filters.promotionsOnly) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Filtres actifs :</span>
              
              {filters.categoryId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Catégorie : {categories.find(c => c.id === filters.categoryId)?.name || filters.categoryId}
                  <button onClick={() => setFilters({ ...filters, categoryId: null })}>
                    <X className="w-3 h-3 hover:text-slate-950" />
                  </button>
                </span>
              )}

              {filters.brand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Marque : {filters.brand}
                  <button onClick={() => setFilters({ ...filters, brand: null })}>
                    <X className="w-3 h-3 hover:text-slate-950" />
                  </button>
                </span>
              )}

              {filters.commercialMode && filters.commercialMode !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  {filters.commercialMode === 'cash' ? 'Achat Comptant' : filters.commercialMode === 'installment' ? 'Échelonné' : 'Tontine'}
                  <button onClick={() => setFilters({ ...filters, commercialMode: 'all' })}>
                    <X className="w-3 h-3 hover:text-slate-950" />
                  </button>
                </span>
              )}

              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                  En stock
                  <button onClick={() => setFilters({ ...filters, inStockOnly: false })}>
                    <X className="w-3 h-3 hover:text-emerald-950" />
                  </button>
                </span>
              )}

              {filters.promotionsOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-medium">
                  Promotions
                  <button onClick={() => setFilters({ ...filters, promotionsOnly: false })}>
                    <X className="w-3 h-3 hover:text-rose-950" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline ml-1"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <LoadingState count={6} />
          ) : (
            <ProductGrid
              products={visibleProducts}
              onResetFilters={handleResetFilters}
            />
          )}

          {/* Progressive Loading / Pagination */}
          {hasMore && !loading && (
            <div className="pt-8 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-colors"
              >
                Afficher plus de produits ({products.length - visibleCount} restants)
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filtrer les produits"
        width="sm"
      >
        <CatalogFilters
          categories={categories}
          brands={brands}
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            setVisibleCount(PAGE_SIZE);
          }}
          onReset={handleResetFilters}
          isMobileDrawer
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />
      </Drawer>

    </div>
  );
};
