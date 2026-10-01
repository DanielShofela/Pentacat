import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
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
    clearCart 
  } = useCart();
  const { setIsCheckoutModalOpen } = useAppNavigation();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-4 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-slate-900">Mon Panier d'Achat</h3>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                {items.length} {items.length > 1 ? 'articles' : 'article'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Votre panier est vide</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Découvrez notre sélection d'électroménager, téléviseurs et équipements garantis.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Explorer le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map(({ product, quantity }) => (
                    <div 
                      key={product.id}
                      className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <img 
                        src={product.images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=200&q=80'} 
                        alt={product.name} 
                        className="w-18 h-18 object-cover rounded-lg bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-tight">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{product.brand}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                          <span className="font-bold text-xs text-amber-700">
                            {formatFCFA(product.priceCash * quantity)}
                          </span>

                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-0.5">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold px-1 text-slate-800">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <button 
                    onClick={() => clearCart()}
                    className="text-slate-400 hover:text-red-600 underline text-[11px]"
                  >
                    Vider le panier
                  </button>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Paiement sécurisé ou à la livraison
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-slate-900">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison :</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">Gratuit (Offert dès 200 000 F)</span>
                    ) : (
                      <span className="font-semibold text-slate-900">{formatFCFA(deliveryFee)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span className="text-amber-700 text-base">{formatFCFA(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Commander via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Aucun compte obligatoire • Commande validée directement avec nos agents PENTA GAD
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
