import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatFCFA } from '../../utils/formatters';
import { Badge } from '../common/Badge';

export const ClassicStoreView: React.FC = () => {
  const { 
    setActiveDomain, 
    selectedCategoryId, 
    setSelectedCategoryId,
    searchQuery,
    setActiveProductModal 
  } = useAppNavigation();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cash' | 'installment' | 'tontine'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching store data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by search query, selected category, and commercial filter
  const filteredProducts = products.filter((prod) => {
    if (selectedCategoryId && prod.categoryId !== selectedCategoryId) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) return false;
    }
    if (selectedFilter === 'cash' && !prod.isCashEligible) return false;
    if (selectedFilter === 'installment' && !prod.isInstallmentEligible) return false;
    if (selectedFilter === 'tontine' && !prod.isTontineEligible) return false;

    return true;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner with Ivory Coast Value Proposition */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl mx-4 sm:mx-6 mt-4 p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Votre distributeur officiel d'équipements en Côte d'Ivoire</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Équipez votre maison en toute sérénité avec <span className="text-amber-400">PENTA GAD</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Électroménager tropicalisé, téléviseurs UHD 4K, climatisation inverter et mobilier de qualité. Choisissez votre formule : 
            <span className="font-semibold text-white"> Achat direct</span>, 
            <span className="font-semibold text-emerald-300"> Paiement échelonné</span> ou 
            <span className="font-semibold text-purple-300"> Tontine rotative</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#catalogue"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Découvrir le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setActiveDomain('installment')}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Facilités de paiement</span>
            </button>
          </div>
        </div>

        {/* Decorative Badge */}
        <div className="hidden lg:block absolute right-8 bottom-8 max-w-xs p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Showroom & Entrepôt Abidjan</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Livraison rapide sur toutes les communes d'Abidjan et expédition sécurisée à l'intérieur du pays.
          </p>
        </div>
      </section>

      {/* 3 Commercial Pillars Cards Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Achat Classique */}
          <div 
            onClick={() => { setSelectedFilter('cash'); }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedFilter === 'cash' 
                ? 'bg-amber-50/80 border-amber-300 shadow-md ring-2 ring-amber-500' 
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Achat Classique</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Commande directe en ligne sans compte obligatoire. Règlement par Mobile Money (Wave, Orange, MTN) ou à la livraison.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-amber-700 gap-1">
              <span>Voir les produits comptant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Paiement Échelonné */}
          <div 
            onClick={() => setActiveDomain('installment')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">2. Paiement Échelonné</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Crédit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Versez un acompte initial de 20% à 30%, puis réglez vos mensualités sur 3 à 8 mois en toute flexibilité avec contrat.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-700 gap-1">
              <span>Simuler un contrat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Tontine Rotative */}
          <div 
            onClick={() => setActiveDomain('tontine')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">3. Tontine Rotative</h3>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">0% Intérêt</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Rejoignez un groupe d'épargne rotative supervisé par PENTA GAD et recevez votre équipement neuf sous garantie à votre tour.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-purple-700 gap-1">
              <span>Voir les groupes ouverts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* Categories Horizontal Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Rayons & Catégories</h2>
            <p className="text-xs text-slate-500">Parcourez les équipements adaptés à vos besoins</p>
          </div>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs text-amber-700 font-semibold hover:underline"
            >
              Afficher tout
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102' 
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="aspect-16/9 rounded-lg overflow-hidden mb-2 bg-slate-100">
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight line-clamp-1">{cat.name}</h4>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                    {cat.itemCount || 10}+ références
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Controls / Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Catalogue Produits</h2>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {filteredProducts.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Garantie constructeur & service après-vente assurés en Côte d'Ivoire
            </p>
          </div>

          {/* Mode Pill Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedFilter('cash')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'cash' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Achat Direct
            </button>
            <button
              onClick={() => setSelectedFilter('installment')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'installment' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Éligible Échelonné
            </button>
            <button
              onClick={() => setSelectedFilter('tontine')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'tontine' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Éligible Tontine
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Aucun produit ne correspond à ces critères</h4>
            <p className="text-xs text-slate-500">Essayez de réinitialiser vos filtres ou votre recherche.</p>
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedFilter('all');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {filteredProducts.map((product) => {
              const estMonthly = Math.round((product.priceInstallment || product.priceCash) * 0.75 / 6);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Badges */}
                    <div 
                      onClick={() => setActiveProductModal(product)}
                      className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                    >
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {product.isFeatured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-600 text-white rounded-md shadow-xs flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Coup de cœur
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 rounded-md">
                          {product.brand}
                        </span>
                      </div>

                      {product.warrantyMonths && (
                        <div className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-white rounded-md backdrop-blur-xs">
                          Garantie {product.warrantyMonths / 12} an(s)
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <div 
                        onClick={() => setActiveProductModal(product)}
                        className="cursor-pointer"
                      >
                        <span className="text-[11px] font-medium text-slate-400">
                          {product.categoryName}
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mt-0.5 group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {/* Multimodal Pricing Display */}
                      <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-slate-500">Prix comptant :</span>
                          <span className="font-black text-amber-800 text-sm">
                            {formatFCFA(product.priceCash)}
                          </span>
                        </div>

                        {product.isInstallmentEligible && (
                          <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-200/60">
                            <span>Échelonné dès :</span>
                            <span className="font-bold">{formatFCFA(estMonthly)} / mois</span>
                          </div>
                        )}
                      </div>

                      {/* Eligibility Indicators */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.isCashEligible && (
                          <Badge variant="amber" size="sm">Achat Direct</Badge>
                        )}
                        {product.isInstallmentEligible && (
                          <Badge variant="emerald" size="sm">Échelonné</Badge>
                        )}
                        {product.isTontineEligible && (
                          <Badge variant="purple" size="sm">Tontine</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ajouter au panier</span>
                    </button>

                    <button
                      onClick={() => setActiveProductModal(product)}
                      className="w-full py-1.5 text-slate-500 hover:text-slate-800 font-semibold text-[11px] text-center"
                    >
                      Voir les 3 modes d'acquisition
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
