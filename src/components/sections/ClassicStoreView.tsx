import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  Truck, 
  MessageCircle,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { ProductGrid } from '../store/ProductGrid';
import { CategoryCard } from '../store/CategoryCard';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';
import { companySettingsService } from '../../services/companySettingsService';

export const ClassicStoreView: React.FC = () => {
  const { 
    setActiveDomain, 
    selectedCategoryId, 
    setSelectedCategoryId,
    searchQuery 
  } = useAppNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cash' | 'installment' | 'tontine'>('all');

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

  // Filter products by category, search, and commercial filter
  const filteredProducts = products.filter((prod) => {
    if (selectedCategoryId && prod.categoryId !== selectedCategoryId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchBrand = prod.brand.toLowerCase().includes(q);
      const matchCategory = prod.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory) return false;
    }
    if (activeFilter === 'cash' && !prod.isCashEligible) return false;
    if (activeFilter === 'installment' && !prod.isInstallmentEligible) return false;
    if (activeFilter === 'tontine' && !prod.isTontineEligible) return false;
    return true;
  });

  const popularProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const recentProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. Hero Minimaliste & Premium */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Subtle Background Photography */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt="Intérieur élégant"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            
            {/* Pill kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium backdrop-blur-xs border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span>Showroom & Distribution officielle · Abidjan</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              L'équipement de votre maison,{' '}
              <span className="text-[#C5A059]">simplifié et garanti</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Électroménager tropicalisé, téléviseurs 4K, climatisation inverter et mobilier moderne. Choisissez votre formule d'acquisition : achat comptant, paiement échelonné ou tontine rotative à 0% d'intérêt.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('catalogue-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explorer le catalogue
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveDomain('installment')}
                className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/40"
                leftIcon={<CreditCard className="w-4 h-4 text-[#C5A059]" />}
              >
                Paiement échelonné
              </Button>
            </div>

            {/* Reassurance points */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Garantie 1 à 3 ans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Livraison Abidjan sous 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                <span>Paiement Wave & Mobile Money</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Les 3 Formules d'Acquisition (Section Sobre & Pédagogique) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">
            Flexibilité d'Achat
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Trois formules pensées pour votre budget
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Un catalogue unique d'équipements certifiés, accessible selon vos préférences de règlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Achat Comptant */}
          <div
            onClick={() => {
              setActiveFilter('cash');
              document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                1. Achat Comptant Direct
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Commandez directement en ligne sans compte obligatoire. Règlement simple par Wave, Orange Money, MTN ou à la livraison à domicile.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 gap-1.5 group-hover:text-[#9A7426] transition-colors">
              <span>Voir les produits en stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Paiement Échelonné */}
          <div
            onClick={() => setActiveDomain('installment')}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBF7EE] text-[#9A7426] flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  2. Paiement Échelonné
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Facilité
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Versez un acompte initial modéré (20% à 30%), puis étalez le solde restant sur 3, 6 ou 8 mensualités adaptées avec contrat.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 gap-1.5 group-hover:text-[#9A7426] transition-colors">
              <span>Simuler un contrat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Tontine Rotative */}
          <div
            onClick={() => setActiveDomain('tontine')}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  3. Tontine Rotative
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100/70 text-purple-800">
                  0% Intérêt
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Rejoignez un groupe d'épargne rotatif supervisé par PENTA GAD. Cotisez chaque mois et recevez votre équipement neuf sous garantie à votre tour.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-slate-900 gap-1.5 group-hover:text-[#9A7426] transition-colors">
              <span>Groupes actuellement ouverts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Catégories Épurées */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">
              Parcourir par rayon
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Catégories principales
            </h2>
          </div>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline"
            >
              Afficher tout
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategoryId === cat.id}
              onClick={() => {
                setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id);
                document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. Produits Populaires / Best-sellers */}
      {popularProducts.length > 0 && !selectedCategoryId && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">
                Les plus demandés
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Sélection Best-Sellers
              </h2>
            </div>
          </div>

          <ProductGrid products={popularProducts} />
        </section>
      )}

      {/* 5. Catalogue Complet & Filtres */}
      <section id="catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">
              Catalogue Général
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tous nos équipements ({filteredProducts.length})
            </h2>
          </div>

          {/* Clean Segmented Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'cash', label: 'Achat Direct' },
              { id: 'installment', label: 'Éligible Échelonné' },
              { id: 'tontine', label: 'Éligible Tontine' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === f.id
                    ? 'bg-white text-slate-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState count={4} />
        ) : (
          <ProductGrid
            products={filteredProducts}
            onResetFilters={() => {
              setSelectedCategoryId(null);
              setActiveFilter('all');
            }}
          />
        )}
      </section>

      {/* 6. Présentation Courte & Rassurante de PENTA GAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C5A059]">
              Engagement & Qualité
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              PENTA GAD Distribution : votre partenaire équipement à Abidjan.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Implantée à Abidjan, PENTA GAD Distribution sélectionne des équipements durables conçus pour le climat tropicalisé. Nous assurons la vente directe, les contrats d'échelonnement et l'animation des groupes d'épargne rotative avec un engagement absolu sur la qualité et le service après-vente.
            </p>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="font-bold text-white block">Stock & Showroom Central</span>
                <p className="text-slate-400">Visite et retrait disponibles à notre entrepôt d'Abidjan.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="font-bold text-white block">Garantie & Techniciens Dédiés</span>
                <p className="text-slate-400">Installation et dépannage SAV sur les climatiseurs et appareils.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WhatsApp Direct CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conseillers disponibles en direct</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Besoin d'un conseil pour votre commande ou votre contrat ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Discutez directement avec un spécialiste PENTA GAD sur WhatsApp pour confirmer les disponibilités, organiser votre livraison ou souscrire à une tontine.
            </p>
          </div>

          <a
            href={companySettingsService.buildWhatsAppUrl("Bonjour PENTA GAD Distribution, je souhaite des renseignements sur vos équipements et disponibilités.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Échanger sur WhatsApp</span>
          </a>
        </div>
      </section>

    </div>
  );
};
