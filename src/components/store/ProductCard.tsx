import React from 'react';
import { ShoppingBag, Eye, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useToast } from '../../context/ToastContext';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { setSelectedProductDetail, setActiveProductModal } = useAppNavigation();
  const { showToast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast({
      type: 'success',
      title: 'Ajouté au panier',
      message: `${product.name} (1x)`,
      productImage: product.images[0],
    });
  };

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductDetail(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monthly estimate if installment eligible (over 6 months with 25% deposit)
  const estMonthly = product.isInstallmentEligible
    ? Math.round(((product.priceInstallment || product.price) * 0.75) / 6)
    : null;

  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  return (
    <div
      onClick={handleOpenDetail}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 transition-all duration-300 hover:border-slate-300 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-50">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {hasDiscount && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-white backdrop-blur-xs shadow-2xs">
                Sélection
              </span>
            )}
            {product.isTontineEligible && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FBF7EE] text-[#9A7426] border border-[#E8DAB7] backdrop-blur-xs">
                Tontine
              </span>
            )}
          </div>

          {product.warrantyMonths && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-white/95 px-2 py-0.5 rounded-md backdrop-blur-xs border border-slate-200/60 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
              <span>{product.warrantyMonths / 12} an{product.warrantyMonths > 12 ? 's' : ''}</span>
            </div>
          )}

          {/* Hover Quick Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
              <Eye className="w-3.5 h-3.5" />
              <span>Fiche complète</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-3.5 pb-2 space-y-1.5">
          {/* Metadata */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">{product.categoryName}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">{product.reference}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-slate-700 transition-colors">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="pt-1 space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-950 tracking-tight">
                {formatFCFA(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatFCFA(product.oldPrice!)}
                </span>
              )}
            </div>

            {/* Installment Hint (Quiet & Elegant) */}
            {estMonthly ? (
              <p className="text-[11px] text-slate-500 font-medium">
                ou dès <span className="text-emerald-700 font-semibold">{formatFCFA(estMonthly)}</span>/mois
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Paiement direct au comptant</p>
            )}
          </div>
        </div>
      </div>

      {/* Button Row */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={handleQuickAdd}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors active:scale-[0.98] shadow-2xs"
          title="Ajouter au panier"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>

        <button
          type="button"
          onClick={handleOpenDetail}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
          title="Voir la fiche produit"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
