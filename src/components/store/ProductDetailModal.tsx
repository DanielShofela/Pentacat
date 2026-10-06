import React, { useState } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Truck, 
  Check, 
  ArrowRight,
  Calculator,
  MessageCircle
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatFCFA } from '../../utils/formatters';

export const ProductDetailModal: React.FC = () => {
  const { 
    activeProductModal, 
    setActiveProductModal, 
    setActiveDomain,
    setSelectedInstallmentProduct,
    setIsCheckoutModalOpen 
  } = useAppNavigation();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'cash' | 'installment' | 'tontine'>('cash');
  const [selectedMonths, setSelectedMonths] = useState<number>(6);

  if (!activeProductModal) return null;

  const product = activeProductModal;

  // Installment calculations
  const minDepositPercent = product.installmentMinDepositPercent || 25;
  const depositAmount = Math.round(product.priceCash * (minDepositPercent / 100));
  const remainingBalance = product.priceCash - depositAmount;
  const monthlyPayment = Math.round(remainingBalance / selectedMonths);

  // Tontine calculation
  const tontineMonthly = Math.round((product.priceTontine || product.priceCash) / 6);

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast({
      type: 'success',
      title: 'Ajouté au panier',
      message: `${product.name} (1x)`,
      productImage: product.images[0],
    });
    setActiveProductModal(null);
  };

  const handleDirectWhatsAppOrder = () => {
    addToCart(product, 1);
    setActiveProductModal(null);
    setIsCheckoutModalOpen(true);
  };

  const handleGoToInstallment = () => {
    setSelectedInstallmentProduct(product);
    setActiveProductModal(null);
    setActiveDomain('installment');
  };

  const handleGoToTontine = () => {
    setActiveProductModal(null);
    setActiveDomain('tontine');
  };

  return (
    <Modal
      isOpen={Boolean(activeProductModal)}
      onClose={() => setActiveProductModal(null)}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Product Photo & Specifications */}
        <div className="space-y-4">
          <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80">
            <img
              src={
                product.images[0] ||
                'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{product.brand}</span>
              <span>·</span>
              <span>{product.categoryName}</span>
              {product.model && (
                <>
                  <span>·</span>
                  <span>Modèle : {product.model}</span>
                </>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
              {product.name}
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Key Points */}
          {product.features && product.features.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                Caractéristiques certifiées :
              </span>
              <ul className="space-y-1">
                {product.features.map((feat, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reassurance pills */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            {product.warrantyMonths && (
              <Badge variant="gold" dot>
                Garantie {product.warrantyMonths / 12} an(s) constructeur
              </Badge>
            )}
            <Badge variant="neutral">Livraison Abidjan & Intérieur</Badge>
          </div>
        </div>

        {/* Right Column: 3 Purchase Modalities Selection */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Formule d'acquisition :
            </span>

            {/* Segmented Control */}
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('cash')}
                className={`flex-1 py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                  activeTab === 'cash'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-900" />
                <span>Comptant</span>
              </button>

              {product.isInstallmentEligible !== false && (
                <button
                  type="button"
                  onClick={() => setActiveTab('installment')}
                  className={`flex-1 py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    activeTab === 'installment'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Échelonné</span>
                </button>
              )}

              {product.isTontineEligible && (
                <button
                  type="button"
                  onClick={() => setActiveTab('tontine')}
                  className={`flex-1 py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    activeTab === 'tontine'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tontine</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Direct Cash Purchase */}
          {activeTab === 'cash' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Prix d'achat direct :</span>
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  {formatFCFA(product.priceCash)}
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                  ✓ En stock showroom · Expédition sous 24h
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Aucun compte obligatoire pour commander.</p>
                <p>• Règlement sécurisé par Wave, Orange Money, MTN ou à la livraison.</p>
                <p>• Facture normalisée et bordereau de garantie fournis.</p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingBag className="w-4 h-4 text-[#C5A059]" />}
                >
                  Ajouter au panier
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={handleDirectWhatsAppOrder}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold"
                  leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
                >
                  Commander sur WhatsApp
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Installment (Échelonné) */}
          {activeTab === 'installment' && product.isInstallmentEligible !== false && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500 font-medium">Prix de référence :</span>
                  <span className="font-bold text-slate-900">
                    {formatFCFA(product.priceInstallment || product.priceCash)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Acompte initial ({minDepositPercent}%) :</span>
                  <span className="font-extrabold text-slate-900">{formatFCFA(depositAmount)}</span>
                </div>

                {/* Duration Picker */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Durée d'étalement :</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[3, 6, 8].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMonths(m)}
                        className={`py-1 text-xs font-bold rounded-lg border transition-colors ${
                          selectedMonths === m
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {m} mois
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Payment Result */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Mensualité estimée :</span>
                  <span className="font-black text-emerald-800 text-sm">
                    {formatFCFA(monthlyPayment)} / mois
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Contrat établi en agence ou en ligne avec pièce d'identité.</p>
                <p>• Mensualités réglées simplement par Mobile Money.</p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleGoToInstallment}
                leftIcon={<Calculator className="w-4 h-4 text-[#C5A059]" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Payer progressivement
              </Button>
            </div>
          )}

          {/* Tab 3: Tontine Rotative */}
          {activeTab === 'tontine' && product.isTontineEligible && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500 font-medium">Valeur lot tontine :</span>
                  <span className="font-bold text-slate-900">
                    {formatFCFA(product.priceTontine || product.priceCash)}
                  </span>
                </div>

                <div className="p-2.5 bg-[#FBF7EE] rounded-lg border border-[#E8DAB7] flex justify-between items-center text-xs">
                  <span className="text-[#9A7426] font-medium">Cotisation mensuelle indicative :</span>
                  <span className="font-black text-[#9A7426] text-sm">
                    {formatFCFA(tontineMonthly)} / mois
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Groupe d'épargne rotatif supervisé et garanti par PENTA GAD Distribution.
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• 0% d'intérêt et 0% de frais d'ouverture.</p>
                <p>• Livraison à votre tour avec garantie complète.</p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleGoToTontine}
                leftIcon={<Users className="w-4 h-4 text-[#C5A059]" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Participer à une tontine
              </Button>
            </div>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-200/60">
            Showroom Abidjan · Assistance téléphonique et WhatsApp officielle
          </div>
        </div>

      </div>
    </Modal>
  );
};
