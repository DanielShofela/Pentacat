import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calculator, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import { productService } from '../../services/productService';
import { installmentService } from '../../services/installmentService';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { formatFCFA } from '../../utils/formatters';

export const InstallmentOverview: React.FC = () => {
  const { user, customer } = useAuth();
  const { setIsAuthModalOpen, selectedInstallmentProduct, setSelectedInstallmentProduct } = useAppNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [depositPercent, setDepositPercent] = useState<number>(25);

  const [name, setName] = useState(customer?.fullName || user?.displayName || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [loading, setLoading] = useState(false);
  const [successContract, setSuccessContract] = useState<string | null>(null);

  useEffect(() => {
    async function loadEligible() {
      const prods = await productService.getProducts('installment');
      setProducts(prods);
      if (selectedInstallmentProduct) {
        setSelectedProduct(selectedInstallmentProduct);
      } else if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
    }
    loadEligible();
  }, [selectedInstallmentProduct]);

  // Dynamic calculations
  const price = selectedProduct ? (selectedProduct.priceInstallment || selectedProduct.priceCash) : 0;
  const depositAmount = Math.round(price * (depositPercent / 100));
  const remainingBalance = Math.max(0, price - depositAmount);
  const monthlyPayment = durationMonths > 0 ? Math.round(remainingBalance / durationMonths) : 0;

  const handleSubmitContractRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedProduct || !name || !phone) {
      alert('Veuillez renseigner toutes les informations.');
      return;
    }

    setLoading(true);
    try {
      const contract = await installmentService.createContractRequest({
        customerId: user.uid,
        customerName: name,
        customerPhone: phone,
        customerEmail: user.email || undefined,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: price,
        depositAmount,
        durationMonths,
      });

      setSuccessContract(contract.contractNumber);
    } catch (err) {
      console.error('Contract request error:', err);
      alert('Erreur lors de la soumission de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Formule Paiement Échelonné PENTA GAD</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Équipez votre maison aujourd'hui, réglez par mensualités adaptées.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Profitez de facilités de paiement transparentes avec un acompte initial léger (20% à 30%) et un échéancier clair sur 3, 6 ou 8 mois. Vos mensualités sont payables simplement par Mobile Money (Wave, Orange, MTN).
          </p>
        </div>
      </div>

      {/* 4 Steps How it works */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Comment fonctionne le paiement échelonné ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900">Choix de l'équipement</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sélectionnez votre produit éligible (réfrigérateur, TV, climatiseur split, machine à laver, salon).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900">Acompte initial de 25%</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Validation du dossier avec pièce d'identité et versement de l'acompte initial de réservation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900">Mensualités Mobile Money</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Réglez sereinement chaque mois par Wave, Orange Money ou MTN avec reçu immédiat dans votre Espace Client.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900">Livraison & Garantie</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Livraison sécurisée à Abidjan ou en région avec garantie constructeur complète et suivi technique SAV.
            </p>
          </div>

        </div>
      </div>

      {/* Simulator & Contract Request Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Simulator */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Simulateur d'échéancier</h3>
          </div>

          {/* Product selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Sélectionnez l'équipement à échelonner :
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setSelectedProduct(p);
              }}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatFCFA(p.priceInstallment || p.priceCash)}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-16 h-16 object-cover rounded-lg bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900">{selectedProduct.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedProduct.brand}</p>
                <p className="font-extrabold text-xs text-emerald-800 mt-1">
                  Valeur de référence : {formatFCFA(price)}
                </p>
              </div>
            </div>
          )}

          {/* Duration selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Durée du contrat :</span>
              <span className="text-emerald-700 font-bold">{durationMonths} mois</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 8].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    durationMonths === m
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m} Mois
                </button>
              ))}
            </div>
          </div>

          {/* Deposit slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Acompte initial de départ :</span>
              <span className="text-emerald-700 font-bold">{depositPercent}% ({formatFCFA(depositAmount)})</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Minimum 20%</span>
              <span>30% recommandé</span>
              <span>50%</span>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex justify-between text-xs text-emerald-950">
              <span>Acompte à la signature :</span>
              <span className="font-bold text-sm text-emerald-800">{formatFCFA(depositAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-950">
              <span>Solde restant à étaler :</span>
              <span className="font-semibold">{formatFCFA(remainingBalance)}</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-950">
              <span>Mensualité à régler ({durationMonths} échéances) :</span>
              <span className="text-base sm:text-lg font-black text-emerald-800">
                {formatFCFA(monthlyPayment)} / mois
              </span>
            </div>
          </div>
        </div>

        {/* Right: Request Submission Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Demande de contrat</h3>
          </div>

          {successContract ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Demande enregistrée !</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Numéro de contrat : <span className="font-bold text-emerald-700">{successContract}</span>
                </p>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Notre service crédit va examiner votre demande et vous contacter sous 24h ouvrées pour la validation des pièces.
              </p>
              <button
                onClick={() => setSuccessContract(null)}
                className="w-full py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Faire une autre simulation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitContractRequest} className="space-y-4">
              {!user && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold">Identification requise :</span> Connectez-vous avec votre compte Google pour soumettre et suivre votre contrat.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom et prénom du souscripteur *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouamé Affoué"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone de contact *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 05 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• La souscription nécessite une pièce nationale d'identité (CNI ou Passeport en cours de validité).</p>
                <p>• Les paiements mensuels s'effectuent sans déplacement via Mobile Money.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Traitement en cours...' : 'Soumettre ma demande de contrat'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contrat commercial PENTA GAD certifié</span>
          </div>
        </div>

      </div>

    </div>
  );
};
