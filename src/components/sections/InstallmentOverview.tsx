import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calculator, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  User, 
  AlertCircle,
  MapPin,
  MessageCircle,
  Package
} from 'lucide-react';
import { productService } from '../../services/productService';
import { installmentService } from '../../services/installmentService';
import { customerService } from '../../services/customerService';
import { Product, InstallmentContract } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatFCFA } from '../../utils/formatters';
import { InstallmentPaymentModal } from '../installment/InstallmentPaymentModal';

export const InstallmentOverview: React.FC = () => {
  const { user, customer } = useAuth();
  const { setIsAuthModalOpen, selectedInstallmentProduct, setActiveDomain } = useAppNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(6);

  const [name, setName] = useState(customer?.fullName || customer?.nom || user?.displayName || '');
  const [phone, setPhone] = useState(customer?.phone || customer?.téléphone || '');
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp || customer?.whatsappNumber || phone || '');
  const [commune, setCommune] = useState(customer?.commune || 'Cocody');
  const [address, setAddress] = useState(customer?.address || customer?.adresse || '');

  const [loading, setLoading] = useState(false);
  const [createdContract, setCreatedContract] = useState<InstallmentContract | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function loadEligible() {
      const prods = await productService.getProducts({ commercialMode: 'installment' });
      setProducts(prods);
      if (selectedInstallmentProduct) {
        setSelectedProduct(selectedInstallmentProduct);
      } else if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
    }
    loadEligible();
  }, [selectedInstallmentProduct]);

  useEffect(() => {
    if (customer) {
      if (!name) setName(customer.fullName || customer.nom || '');
      if (!phone) setPhone(customer.phone || customer.téléphone || '');
      if (!whatsapp) setWhatsapp(customer.whatsapp || customer.whatsappNumber || customer.phone || '');
      if (!address) setAddress(customer.address || customer.adresse || '');
      if (customer.commune) setCommune(customer.commune);
    }
  }, [customer]);

  const price = selectedProduct ? (selectedProduct.priceInstallment || selectedProduct.priceCash) : 0;
  const monthlyPayment = durationMonths > 0 ? Math.round(price / durationMonths) : 0;

  const handleSubmitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedProduct || !name || !phone) {
      alert('Veuillez renseigner votre nom complet et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sync / Update customer profile in Firestore
      await customerService.updateCustomer(user.uid, {
        nom: name,
        fullName: name,
        téléphone: phone,
        phone: phone,
        whatsapp: whatsapp || phone,
        commune,
        adresse: address,
        address: address,
      });

      // 2. Create the installment contract in Firestore
      const contract = await installmentService.createContract({
        customerId: user.uid,
        customerName: name,
        customerPhone: phone,
        product: selectedProduct,
        duration: durationMonths,
        frequency: 'monthly',
        deliveryAddress: address,
        deliveryCommune: commune,
      });

      setCreatedContract(contract);
    } catch (err) {
      console.error('Contract request error:', err);
      alert('Erreur lors de la création du contrat.');
    } finally {
      setLoading(false);
    }
  };

  const communeOptions = [
    { value: 'Cocody', label: 'Cocody' },
    { value: 'Yopougon', label: 'Yopougon' },
    { value: 'Marcory', label: 'Marcory' },
    { value: 'Koumassi', label: 'Koumassi' },
    { value: 'Plateau', label: 'Plateau' },
    { value: 'Abobo', label: 'Abobo' },
    { value: 'Treichville', label: 'Treichville' },
    { value: 'Riviera', label: 'Riviera' },
    { value: 'Angré', label: 'Angré' },
    { value: 'Autre commune', label: 'Autre commune' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 pb-24">
      
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium backdrop-blur-xs border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>Paiement Échelonné PENTA GAD</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Paiement échelonné : équipez votre maison selon votre rythme.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
            Choisissez votre équipement éligible et étalez son règlement sur 3, 6 ou 8 mensualités transparentes sans démarche bancaire lourde. Les données financières sont certifiées et tracées dans votre Espace Client.
          </p>
        </div>
      </div>

      {/* 4 Steps How it works */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">Processus simple & transparent</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Comment fonctionne le paiement échelonné ?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Choix de l\'équipement',
              desc: 'Sélectionnez un équipement certifié éligible (réfrigérateur, TV, split, mobilier).',
            },
            {
              step: '02',
              title: 'Souscription du contrat',
              desc: 'Création du contrat certifié avec votre profil client identifié côté serveur.',
            },
            {
              step: '03',
              title: 'Versements échelonnés',
              desc: 'Réglez vos échéances par Mobile Money (Wave, Orange, MTN) avec reçu certifié.',
            },
            {
              step: '04',
              title: 'Livraison automatique',
              desc: 'Dès que le solde est intégralement réglé, la livraison est immédiatement déclenchée.',
            },
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-[#C5A059]">{item.step}</span>
              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator + Contract Request */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Selector & Simulation Details */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Simulateur d'échéances</h3>
          </div>

          {/* Product selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 tracking-tight">
              Équipement à financer :
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-slate-950 bg-slate-50 shadow-2xs ring-1 ring-slate-950'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{p.brand} · Réf : {p.reference}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-slate-950 shrink-0">
                      {formatFCFA(p.priceInstallment || p.priceCash)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Durée du contrat :</span>
              <span className="text-slate-900 font-bold">{durationMonths} mois</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 8].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    durationMonths === m
                      ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {m} Mois
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Prix de l'équipement :</span>
              <span className="font-bold text-slate-900">{formatFCFA(price)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Nombre d'échéances mensuelles :</span>
              <span className="font-semibold text-slate-900">{durationMonths} mensualités</span>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-baseline text-xs font-bold text-slate-900">
              <span>Mensualité estimée :</span>
              <span className="text-lg sm:text-xl font-black text-slate-950">
                {formatFCFA(monthlyPayment)} / mois
              </span>
            </div>
          </div>
        </div>

        {/* Right: Contract Creation Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Souscription du contrat</h3>
          </div>

          {createdContract ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Contrat créé avec succès</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Numéro de contrat :{' '}
                  <span className="font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">
                    {createdContract.contractNumber}
                  </span>
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-left space-y-2">
                <p className="font-semibold text-slate-800">Votre contrat est actif dans Firestore :</p>
                <p>• Total : {formatFCFA(createdContract.totalAmount)}</p>
                <p>• Mensualité : {formatFCFA(createdContract.monthlyPayment)} / mois sur {createdContract.duration} mois</p>
                <p>• Dès que le solde atteint 100%, la livraison se déclenche automatiquement.</p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={() => setIsPaymentModalOpen(true)}
                  leftIcon={<CreditCard className="w-4 h-4 text-[#C5A059]" />}
                >
                  Effectuer un premier versement
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  size="md"
                  onClick={() => setActiveDomain('customer')}
                >
                  Voir dans mon Espace Client
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  onClick={() => setCreatedContract(null)}
                >
                  Nouvelle simulation
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitContract} className="space-y-4">
              {!user && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Identification requise :</span> Connectez-vous avec votre compte pour créer et sécuriser votre contrat.
                  </div>
                </div>
              )}

              <Input
                label="Nom et Prénom *"
                required
                placeholder="Ex: Jean Kouadio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Téléphone *"
                  type="tel"
                  required
                  placeholder="Ex: 07 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="WhatsApp de contact"
                  type="tel"
                  placeholder="Ex: 07 00 00 00 00"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                />
              </div>

              <Select
                label="Commune de résidence *"
                options={communeOptions}
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
              />

              <Input
                label="Adresse précise de livraison *"
                required
                placeholder="Ex: Angré 8ème tranche, villa 40"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <p>• Tracabilité certifiée : chaque versement met à jour votre solde en temps réel.</p>
                <p>• Livraison déclenchée automatiquement dès solde complet.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Valider et souscrire mon contrat
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contrat certifié PENTA GAD Distribution</span>
          </div>
        </div>

      </div>

      {createdContract && isPaymentModalOpen && (
        <InstallmentPaymentModal
          contract={createdContract}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={() => {
            setActiveDomain('customer');
          }}
        />
      )}

    </div>
  );
};
