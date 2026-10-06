import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Truck, 
  Check, 
  Share2, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA, sanitizePhoneForWhatsApp, PENTA_GAD_CONTACTS } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QuantitySelector } from '../ui/QuantitySelector';

export interface ProductSheetProps {
  product: Product;
  onBack?: () => void;
}

export const ProductSheet: React.FC<ProductSheetProps> = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const { setActiveDomain, setSelectedInstallmentProduct, setIsCheckoutModalOpen } = useAppNavigation();
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features'>('description');

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80'];

  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  // Monthly estimate if installment eligible (over 6 months, 25% deposit)
  const depositPercent = product.installmentMinDepositPercent || 25;
  const depositAmount = Math.round(product.price * (depositPercent / 100));
  const maxMonths = product.installmentMaxMonths || 6;
  const estMonthly = Math.round((product.price - depositAmount) / maxMonths);

  // Tontine estimate
  const estTontineMonthly = Math.round((product.priceTontine || product.price) / 6);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast({
      type: 'success',
      title: 'Ajouté au panier',
      message: `${product.name} (${quantity}x)`,
      productImage: images[0],
    });
  };

  const handleWhatsAppInstantOrder = () => {
    addToCart(product, quantity);
    setIsCheckoutModalOpen(true);
  };

  const handleGoToInstallment = () => {
    setSelectedInstallmentProduct(product);
    setActiveDomain('installment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToTontine = () => {
    setActiveDomain('tontine');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 pb-24">
      
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </button>
      )}

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Gallery & Image Optimizer */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Photo Viewport */}
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs">
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} - Vue ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="eager"
            />

            {/* Badges on main photo */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {hasDiscount && (
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-xs">
                  -{discountPercent}%
                </span>
              )}
              {product.isFeatured && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-white shadow-xs">
                  Coup de cœur
                </span>
              )}
            </div>

            {product.warrantyMonths && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Garantie {product.warrantyMonths / 12} an(s)</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      isActive
                        ? 'border-slate-950 ring-2 ring-slate-950/10'
                        : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Miniature ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Description & Technical Specifications Tabs */}
          <div className="pt-6 border-t border-slate-200/80 space-y-4">
            <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`pb-3 transition-colors border-b-2 ${
                  activeTab === 'description'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Description détaillée
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={`pb-3 transition-colors border-b-2 ${
                  activeTab === 'features'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Fiche technique ({product.features.length})
              </button>
            </div>

            {activeTab === 'description' ? (
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                <p className="font-medium text-slate-800">{product.shortDescription}</p>
                <p className="text-slate-600">{product.fullDescription || product.description}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Right: Commercial Sheet & Order Options */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Header Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-slate-900 font-bold">{product.brand}</span>
                <span>·</span>
                <span>{product.categoryName}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Réf: {product.reference}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {formatFCFA(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                  {formatFCFA(product.oldPrice!)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={product.stock > 0 ? 'text-emerald-800 font-bold' : 'text-rose-600 font-bold'}>
                  {product.stock > 0 ? `En stock showroom (${product.stock} dispo)` : 'Rupture temporaire'}
                </span>
              </div>
              <span className="text-slate-500">Livraison Abidjan sous 24h</span>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700">Quantité :</span>
            <QuantitySelector
              quantity={quantity}
              onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
              onIncrease={() => setQuantity(quantity + 1)}
              max={product.stock || 10}
            />
          </div>

          {/* Action Buttons as requested */}
          <div className="space-y-3 pt-2">
            
            {/* 1. AJOUTER AU PANIER */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              leftIcon={<ShoppingBag className="w-4 h-4 text-[#C5A059]" />}
            >
              AJOUTER AU PANIER
            </Button>

            {/* 2. COMMANDER SUR WHATSAPP */}
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleWhatsAppInstantOrder}
              leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
            >
              COMMANDER SUR WHATSAPP
            </Button>

            {/* 3. PAYER PROGRESSIVEMENT (si éligible) */}
            {product.isInstallmentEligible && (
              <div className="pt-2">
                <Button
                  variant="gold"
                  fullWidth
                  size="md"
                  onClick={handleGoToInstallment}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                >
                  PAYER PROGRESSIVEMENT
                </Button>
                <p className="text-[11px] text-center text-slate-500 mt-1">
                  Acompte de {formatFCFA(depositAmount)} ({depositPercent}%) · dès {formatFCFA(estMonthly)}/mois sur {maxMonths} mois
                </p>
              </div>
            )}

            {/* 4. PARTICIPER À UNE TONTINE (uniquement si configuré éligible) */}
            {product.isTontineEligible && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoToTontine}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>PARTICIPER À UNE TONTINE</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-1">
                  Épargne collective à 0% d'intérêt · Cotisation estimée à {formatFCFA(estTontineMonthly)}/mois
                </p>
              </div>
            )}

          </div>

          {/* Delivery & Reassurance Footer */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Livraison à domicile sur Abidjan et expédition sécurisée en province.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Appareil neuf d'origine certifié avec facture normalisée.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
