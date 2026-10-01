import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Truck, 
  Check, 
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatFCFA } from '../../utils/formatters';

export const ProductDetailModal: React.FC = () => {
  const { 
    activeProductModal, 
    setActiveProductModal, 
    setActiveDomain,
    setSelectedInstallmentProduct,
    setSelectedTontineGroup,
    setIsAuthModalOpen
  } = useAppNavigation();
  const { addToCart } = useCart();
  const { user } = useAuth();

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
  const tontineContribution = Math.round((product.priceTontine || product.priceCash) / 6);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setActiveProductModal(null);
  };

  const handleSelectInstallment = () => {
    setSelectedInstallmentProduct(product);
    setActiveProductModal(null);
    setActiveDomain('installment');
  };

  const handleSelectTontine = () => {
    setActiveProductModal(null);
    setActiveDomain('tontine');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {product.categoryName}
            </span>
            <span className="text-xs text-slate-500">• {product.brand}</span>
          </div>
          <button
            onClick={() => setActiveProductModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Left: Product Images & Specs */}
          <div className="space-y-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{product.name}</h3>
              {product.model && (
                <p className="text-xs text-slate-500 mt-0.5">Modèle : {product.model}</p>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Points forts :</h5>
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

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              {product.warrantyMonths && (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Garantie {product.warrantyMonths / 12} an(s)
                </span>
              )}
              <span className="flex items-center gap-1 text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                <Truck className="w-3.5 h-3.5" />
                Livraison Abidjan & Intérieur
              </span>
            </div>
          </div>

          {/* Right: The 3 Coexisting Purchase Modalities */}
          <div className="flex flex-col justify-between space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Choisissez votre formule d'acquisition :
              </h4>

              {/* Tabs for 3 systems */}
              <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('cash')}
                  className={`py-2 px-2 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    activeTab === 'cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Achat Direct</span>
                </button>
                <button
                  onClick={() => setActiveTab('installment')}
                  className={`py-2 px-2 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    activeTab === 'installment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Échelonné</span>
                </button>
                <button
                  onClick={() => setActiveTab('tontine')}
                  className={`py-2 px-2 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    activeTab === 'tontine' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tontine</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-4">
                {/* 1. Cash Purchase Tab */}
                {activeTab === 'cash' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-500 font-medium">Prix d'achat direct comptant :</span>
                      <div className="text-2xl font-black text-amber-800 mt-1">
                        {formatFCFA(product.priceCash)}
                      </div>
                      <p className="text-xs text-emerald-700 font-medium mt-1">
                        ✓ En stock disponible immédiatement pour livraison
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1.5">
                      <p>• Aucun compte requis pour commander en direct.</p>
                      <p>• Paiement sécurisé par Wave, Orange Money, MTN ou à la livraison.</p>
                      <p>• Facture normalisée et bordereau de garantie fournis.</p>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                )}

                {/* 2. Installment Tab */}
                {activeTab === 'installment' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Prix échelonné total :</span>
                        <span className="font-bold text-slate-900">{formatFCFA(product.priceInstallment || product.priceCash)}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Acompte initial requis ({minDepositPercent}%) :</span>
                        <span className="font-black text-emerald-700 text-sm">{formatFCFA(depositAmount)}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Durée d'échelonnement :</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[3, 6, 8].map((m) => (
                            <button
                              key={m}
                              onClick={() => setSelectedMonths(m)}
                              className={`py-1 text-xs font-semibold rounded border ${
                                selectedMonths === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              {m} mois
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex justify-between items-center">
                        <span className="text-emerald-900 font-medium">Mensualité estimée :</span>
                        <span className="font-black text-emerald-700 text-sm">{formatFCFA(monthlyPayment)} / mois</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Contrat établi avec pièce d'identité (CNI / Passeport).</p>
                      <p>• Suivi automatisé de vos règlements dans l'Espace Client.</p>
                      <p>• Livraison déclenchée selon les conditions du contrat.</p>
                    </div>

                    <button
                      onClick={handleSelectInstallment}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Simuler & Demander l'échelonnement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 3. Tontine Tab */}
                {activeTab === 'tontine' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Valeur produit tontine :</span>
                        <span className="font-bold text-slate-900">{formatFCFA(product.priceTontine || product.priceCash)}</span>
                      </div>

                      <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs flex justify-between items-center">
                        <span className="text-purple-900 font-medium">Cotisation mensuelle indicative :</span>
                        <span className="font-black text-purple-700 text-sm">{formatFCFA(tontineContribution)} / mois</span>
                      </div>

                      <p className="text-[11px] text-purple-900 font-medium">
                        Groupe rotatif de 6 à 10 membres supervisé par PENTA GAD Distribution.
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Aucun intérêt ni frais cachés.</p>
                      <p>• Tirage au sort transparent ou choix de position à l'adhésion.</p>
                      <p>• Livraison de votre équipement neuf sous garantie à votre tour.</p>
                    </div>

                    <button
                      onClick={handleSelectTontine}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                    >
                      <Users className="w-4 h-4" />
                      <span>Voir les groupes de tontine ouverts</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-center text-slate-400 pt-2 border-t border-slate-200">
              PENTA GAD Distribution • Showroom Abidjan & Service Commercial
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
