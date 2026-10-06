import React from 'react';
import { ShoppingBag, ArrowRight, MessageCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { QuantitySelector } from '../ui/QuantitySelector';
import { EmptyState } from '../ui/EmptyState';
import { useCart } from '../../context/CartContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { formatFCFA } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    clearCart,
  } = useCart();
  const { setIsCheckoutModalOpen } = useAppNavigation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="Mon Panier"
      subtitle={`${items.length} article${items.length > 1 ? 's' : ''} sélectionné${items.length > 1 ? 's' : ''}`}
      width="md"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            {/* Totals Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total articles :</span>
                <span className="font-semibold text-slate-900">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Livraison Abidjan :</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">Offerte dès 200 000 F</span>
                  ) : (
                    <span className="font-semibold text-slate-900">{formatFCFA(deliveryFee)}</span>
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-baseline text-sm font-bold text-slate-950">
                <span>Total estimé :</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-950">
                  {formatFCFA(total)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleCheckout}
                leftIcon={<MessageCircle className="w-4 h-4 text-[#C5A059]" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Commander via WhatsApp
              </Button>

              <p className="text-[11px] text-center text-slate-400">
                Sans compte obligatoire · Validation directe avec un conseiller PENTA GAD
              </p>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" />}
          title="Votre panier est vide"
          description="Découvrez nos équipements pour la maison garantis et prêts à être livrés."
          actionLabel="Parcourir les produits"
          onAction={() => setIsCartOpen(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Articles</span>
            <button
              onClick={() => clearCart()}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
            >
              Vider le panier
            </button>
          </div>

          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3.5 p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs"
              >
                <img
                  src={
                    product.images[0] ||
                    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={product.name}
                  className="w-18 h-18 object-cover rounded-lg bg-slate-50 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span>{product.brand}</span>
                      <span>·</span>
                      <span>Réf : <span className="font-mono text-slate-600 font-semibold">{product.reference}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-slate-950">
                      {formatFCFA(product.priceCash * quantity)}
                    </span>

                    <QuantitySelector
                      size="sm"
                      quantity={quantity}
                      onDecrease={() => updateQuantity(product.id, quantity - 1)}
                      onIncrease={() => updateQuantity(product.id, quantity + 1)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paiement sécurisé par Mobile Money ou à la livraison</span>
          </div>
        </div>
      )}
    </Drawer>
  );
};
