import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  MessageCircle, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Clock, 
  Truck, 
  History, 
  PlusCircle, 
  AlertTriangle, 
  Package, 
  ChevronRight, 
  ExternalLink, 
  LayoutDashboard, 
  Banknote, 
  Building2, 
  Smartphone,
  Eye,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useToast } from '../../context/ToastContext';
import { customerService } from '../../services/customerService';
import { 
  customerPortalService, 
  UnifiedPaymentItem, 
  UnifiedDeliveryItem, 
  CustomerDashboardMetrics 
} from '../../services/customerPortalService';
import { 
  Order, 
  InstallmentContract, 
  TontineMember, 
  TontineGroup 
} from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { formatFCFA, formatDate, sanitizePhoneForWhatsApp, PENTA_GAD_CONTACTS } from '../../utils/formatters';
import { InstallmentContractCard } from '../installment/InstallmentContractCard';
import { InstallmentPaymentModal } from '../installment/InstallmentPaymentModal';
import { TontineContributionModal } from '../tontine/TontineContributionModal';

export type PortalSection = 
  | 'overview' 
  | 'orders' 
  | 'installments' 
  | 'tontines' 
  | 'payments' 
  | 'deliveries' 
  | 'profile';

export const CustomerPortalOverview: React.FC = () => {
  const { user, customer, logout } = useAuth();
  const { setIsAuthModalOpen, setActiveDomain } = useAppNavigation();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<PortalSection>('overview');
  const [loading, setLoading] = useState(true);

  // Consolidated Portal Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<InstallmentContract[]>([]);
  const [memberships, setMemberships] = useState<(TontineMember & { group?: TontineGroup | null })[]>([]);
  const [unifiedPayments, setUnifiedPayments] = useState<UnifiedPaymentItem[]>([]);
  const [unifiedDeliveries, setUnifiedDeliveries] = useState<UnifiedDeliveryItem[]>([]);
  const [metrics, setMetrics] = useState<CustomerDashboardMetrics>({
    activeOrdersCount: 0,
    activeContractsCount: 0,
    activeTontinesCount: 0,
    totalRemainingBalance: 0,
    nextPaymentDueDate: null,
    nextPaymentDueAmount: null,
    nextRotationDate: null,
    nextRotationGroupName: null,
  });

  // Modals state
  const [selectedContractForPayment, setSelectedContractForPayment] = useState<InstallmentContract | null>(null);
  const [selectedTontineForPayment, setSelectedTontineForPayment] = useState<(TontineMember & { group?: TontineGroup | null }) | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    nom: customer?.fullName || customer?.nom || user?.displayName || '',
    phone: customer?.phone || customer?.téléphone || '',
    whatsapp: customer?.whatsapp || customer?.whatsappNumber || '',
    commune: customer?.commune || 'Cocody',
    address: customer?.address || customer?.adresse || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await customerPortalService.getCustomerPortalData(user.uid);
      setOrders(data.orders);
      setContracts(data.contracts);
      setMemberships(data.memberships);
      setUnifiedPayments(data.unifiedPayments);
      setUnifiedDeliveries(data.unifiedDeliveries);
      setMetrics(data.metrics);
    } catch (err) {
      console.warn('Error loading customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (customer) {
      setProfileForm({
        nom: customer.fullName || customer.nom || user?.displayName || '',
        phone: customer.phone || customer.téléphone || '',
        whatsapp: customer.whatsapp || customer.whatsappNumber || customer.phone || '',
        commune: customer.commune || 'Cocody',
        address: customer.address || customer.adresse || '',
      });
    }
  }, [customer, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await customerService.updateCustomer(user.uid, {
        nom: profileForm.nom,
        fullName: profileForm.nom,
        téléphone: profileForm.phone,
        phone: profileForm.phone,
        whatsapp: profileForm.whatsapp,
        commune: profileForm.commune,
        adresse: profileForm.address,
        address: profileForm.address,
      });
      showToast({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Vos informations contractuelles ont été enregistrées.',
      });
    } catch (err) {
      console.error('Update profile error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder votre profil.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Helper for first name
  const rawName = customer?.fullName || customer?.nom || user?.displayName || 'Client';
  const firstName = rawName.split(' ')[0] || 'Client';

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200/80 shadow-2xs">
          <User className="w-8 h-8 text-[#C5A059]" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
            <span>/mon-espace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Espace Client PENTA GAD
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Connectez-vous pour retrouver au même endroit vos commandes directes, vos échéances de paiement échelonné, vos tontines et vos livraisons.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsAuthModalOpen(true)}
          leftIcon={<User className="w-4 h-4 text-[#C5A059]" />}
        >
          Se connecter avec Google
        </Button>
      </div>
    );
  }

  // Navigation Items
  const navSections: { id: PortalSection; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Mes commandes', icon: <ShoppingBag className="w-4 h-4" />, count: orders.length },
    { id: 'installments', label: 'Mes paiements échelonnés', icon: <CreditCard className="w-4 h-4" />, count: contracts.length },
    { id: 'tontines', label: 'Mes tontines', icon: <Users className="w-4 h-4" />, count: memberships.length },
    { id: 'payments', label: 'Mes paiements', icon: <Banknote className="w-4 h-4" />, count: unifiedPayments.length },
    { id: 'deliveries', label: 'Mes livraisons', icon: <Truck className="w-4 h-4" />, count: unifiedDeliveries.length },
    { id: 'profile', label: 'Mes informations', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-32 lg:pb-24">
      
      {/* Customer Header Strip */}
      <div className="p-5 sm:p-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-xs uppercase shrink-0">
            <span className="text-[#C5A059]">{firstName.charAt(0)}</span>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bonjour {firstName} 👋
              </h1>
              <Badge variant="green" size="sm" dot>Compte Client Certifié</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {customer?.commune || 'Cocody'}, Abidjan · Côte d'Ivoire
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <a
            href={`https://wa.me/${sanitizePhoneForWhatsApp(PENTA_GAD_CONTACTS.whatsapp)}?text=${encodeURIComponent(`Bonjour PENTA GAD, je suis ${rawName} concernant mon espace client.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Assistance WhatsApp</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-400" />}
          >
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Desktop / Tablet Section Navigation Tabs */}
      <div className="flex border-b border-slate-200/80 overflow-x-auto gap-1 sm:gap-2 no-scrollbar py-0.5">
        {navSections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`pb-3.5 px-3 sm:px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-slate-950 text-slate-950 bg-slate-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-800'
              }`}
            >
              <span className={isActive ? 'text-[#C5A059]' : 'text-slate-400'}>{sec.icon}</span>
              <span>{sec.label}</span>
              {typeof sec.count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-100 text-slate-500'
                }`}>
                  {sec.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Panels */}
      <div>
        
        {/* ============================================================== */}
        {/* 1. VUE D'ENSEMBLE (ACCUEIL DU DASHBOARD) */}
        {/* ============================================================== */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            
            {/* 6 Key Responsive Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              {/* Card 1: Commandes actives */}
              <button
                type="button"
                onClick={() => setActiveSection('orders')}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 text-left transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-semibold">Commandes</span>
                  <ShoppingBag className="w-4 h-4 text-slate-700" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {metrics.activeOrdersCount}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">En cours de traitement</p>
              </button>

              {/* Card 2: Contrats en cours */}
              <button
                type="button"
                onClick={() => setActiveSection('installments')}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 text-left transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-semibold">Échelonné</span>
                  <CreditCard className="w-4 h-4 text-[#C5A059]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {metrics.activeContractsCount}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Contrats actifs</p>
              </button>

              {/* Card 3: Tontines actives */}
              <button
                type="button"
                onClick={() => setActiveSection('tontines')}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 text-left transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-semibold">Tontines</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {metrics.activeTontinesCount}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Participations</p>
              </button>

              {/* Card 4: Solde total à payer */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 shadow-2xs text-left">
                <div className="flex items-center justify-between text-amber-800 mb-2">
                  <span className="text-[11px] font-semibold">Solde à payer</span>
                  <Banknote className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-950 tracking-tight truncate">
                  {formatFCFA(metrics.totalRemainingBalance)}
                </div>
                <p className="text-[10px] text-amber-700 mt-1 font-medium">Cumul restant dû</p>
              </div>

              {/* Card 5: Prochaine échéance */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-left">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-semibold">Prochaine échéance</span>
                  <Clock className="w-4 h-4 text-slate-700" />
                </div>
                <div className="text-xs font-bold text-slate-950 line-clamp-1">
                  {metrics.nextPaymentDueDate ? formatDate(metrics.nextPaymentDueDate) : 'À jour'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {metrics.nextPaymentDueAmount ? `${formatFCFA(metrics.nextPaymentDueAmount)} / mois` : 'Aucune échéance urgente'}
                </p>
              </div>

              {/* Card 6: Prochaine rotation */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-left">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-semibold">Prochaine rotation</span>
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-slate-950 line-clamp-1">
                  {metrics.nextRotationDate ? formatDate(metrics.nextRotationDate) : 'Aucun tirage'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {metrics.nextRotationGroupName || 'Tontine active'}
                </p>
              </div>

            </div>

            {/* In-Flight Delivery Alert Banner (if any) */}
            {unifiedDeliveries.length > 0 && unifiedDeliveries.some(d => d.status === 'shipped' || d.status === 'scheduled') && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Une livraison est en cours d'acheminement</h4>
                    <p className="text-xs text-emerald-800">
                      Destination : <strong>{unifiedDeliveries[0].destinationCommune}</strong> - {unifiedDeliveries[0].destinationAddress}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveSection('deliveries')}
                  className="shrink-0"
                >
                  Suivre la livraison
                </Button>
              </div>
            )}

            {/* Quick Sections Highlights: Échelonné & Tontines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Highlight: Derniers contrats échelonnés */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C5A059]" />
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Paiements Échelonnés Actifs</h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('installments')}
                    className="text-xs text-[#9A7426] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Voir tout</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {contracts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Aucun contrat échelonné pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {contracts.slice(0, 2).map((ctr) => (
                      <div key={ctr.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1">{ctr.productSnapshot.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Réf : {ctr.contractNumber}</span>
                          </div>
                          <Badge variant={ctr.status === 'completed' ? 'green' : 'gold'} size="sm">
                            {ctr.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Payé : {formatFCFA(ctr.amountPaid)}</span>
                          <span>Reste : <strong className="text-slate-900">{formatFCFA(ctr.remainingAmount)}</strong></span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-slate-950 h-full rounded-full"
                            style={{ width: `${Math.max(2, ctr.progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Highlight: Tontines */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Vos Participations Tontine</h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('tontines')}
                    className="text-xs text-[#9A7426] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Voir tout</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {memberships.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Vous ne participez à aucune tontine.</p>
                ) : (
                  <div className="space-y-3">
                    {memberships.slice(0, 2).map((m) => (
                      <div key={m.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1">{m.productSnapshot.name}</span>
                            <span className="text-[10px] text-slate-400">Tour #{m.position} · {m.group?.groupCode || 'Tontine'}</span>
                          </div>
                          <Badge variant="blue" size="sm">Position #{m.position}</Badge>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Cotisé : {formatFCFA(m.totalContributed)}</span>
                          <span>Tour : <strong>{formatDate(m.beneficiaryDate)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. MES COMMANDES */}
        {/* ============================================================== */}
        {activeSection === 'orders' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Mes commandes directes ({orders.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Historique de vos commandes passées via le panier ou WhatsApp.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDomain('store')}
                leftIcon={<ShoppingBag className="w-3.5 h-3.5 text-slate-700" />}
              >
                Explorer le catalogue
              </Button>
            </div>

            {orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
                title="Aucune commande directe"
                description="Vous n'avez pas encore passé de commande classique."
                actionLabel="Découvrir les équipements"
                onAction={() => setActiveDomain('store')}
              />
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg">
                          {ord.orderNumber}
                        </span>
                        <Badge variant={ord.orderStatus === 'delivered' ? 'green' : 'slate'} dot>
                          {ord.orderStatus}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(ord.createdAt)}</span>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-800">
                          <span className="font-medium">{item.quantity}x {item.productName}</span>
                          <span className="font-bold">{formatFCFA(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500">
                        Livraison : <strong>{ord.deliveryCommune || 'Abidjan'}</strong> ({ord.deliveryAddress || 'Showroom'})
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-500 font-medium">Total :</span>
                        <span className="text-base font-black text-slate-950">{formatFCFA(ord.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. MES PAIEMENTS ÉCHELONNÉS */}
        {/* ============================================================== */}
        {activeSection === 'installments' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Mes contrats échelonnés ({contracts.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Suivez vos mensualités, effectuez des versements et suivez la livraison automatique dès que le solde est atteint.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDomain('installment')}
                leftIcon={<CreditCard className="w-3.5 h-3.5 text-slate-700" />}
              >
                Simuler un contrat
              </Button>
            </div>

            {contracts.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="w-8 h-8 text-slate-400" />}
                title="Aucun contrat de paiement échelonné"
                description="Étalez le paiement de vos gros équipements sur 3, 6 ou 8 mois sans formalité bancaire."
                actionLabel="Simuler mon premier contrat"
                onAction={() => setActiveDomain('installment')}
              />
            ) : (
              <div className="space-y-4">
                {contracts.map((ctr) => (
                  <InstallmentContractCard
                    key={ctr.id}
                    contract={ctr}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. MES TONTINES */}
        {/* ============================================================== */}
        {activeSection === 'tontines' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Mes tontines rotatives ({memberships.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Groupes d'épargne rotative de 10 personnes · Confidentialité stricte des autres membres.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDomain('tontine')}
                leftIcon={<Users className="w-3.5 h-3.5 text-slate-700" />}
              >
                Voir les tontines ouvertes
              </Button>
            </div>

            {memberships.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-slate-400" />}
                title="Vous ne participez à aucune tontine"
                description="Rejoignez un groupe rotatif de 10 membres pour acquérir votre équipement à 0% d'intérêt."
                actionLabel="Rejoindre un groupe"
                onAction={() => setActiveDomain('tontine')}
              />
            ) : (
              <div className="space-y-5">
                {memberships.map((m) => {
                  const progressPercent = m.expectedContribution > 0 
                    ? Math.min(100, Math.round((m.totalContributed / m.expectedContribution) * 100))
                    : 0;
                  const isBeneficiaryNow = m.group?.currentRotationPosition === m.position;

                  return (
                    <div key={m.id} className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                      
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm bg-slate-950 text-[#C5A059] px-2.5 py-1 rounded-xl">
                            Tour #{m.position}
                          </span>
                          <div>
                            <h4 className="font-black text-sm sm:text-base text-slate-900">
                              {m.group?.name || 'Groupe Tontine PENTA GAD'}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Code : {m.group?.groupCode || m.groupId.slice(0, 8)} · Rotation de {m.group?.rotationPeriodDays || 10} jours
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isBeneficiaryNow ? (
                            <Badge variant="gold" dot>C'est votre tour !</Badge>
                          ) : (
                            <Badge variant="blue" dot>Actif</Badge>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedTontineForPayment(m)}
                            leftIcon={<CreditCard className="w-3.5 h-3.5 text-[#C5A059]" />}
                          >
                            Cotiser
                          </Button>
                        </div>
                      </div>

                      {/* Product snapshot chosen by user */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {m.productSnapshot.imageUrl ? (
                            <img src={m.productSnapshot.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-400" />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{m.productSnapshot.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {m.productSnapshot.brand} · Réf: {m.productSnapshot.reference}
                            </span>
                          </div>
                        </div>
                        <span className="font-black text-slate-950 text-sm">
                          {formatFCFA(m.expectedContribution)}
                        </span>
                      </div>

                      {/* 4 Metrics Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Total Cotisé</span>
                          <span className="font-black text-emerald-800 text-sm mt-0.5 block">
                            {formatFCFA(m.totalContributed)}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Solde Restant</span>
                          <span className="font-black text-amber-900 text-sm mt-0.5 block">
                            {formatFCFA(m.remainingAmount)}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Votre date de rotation</span>
                          <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                            {formatDate(m.beneficiaryDate)}
                          </span>
                        </div>

                        {/* Privacy Preserved: Bénéficiaire actuel masked */}
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Bénéficiaire actuel</span>
                          <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                            Tour #{m.group?.currentRotationPosition || 1} en cours
                          </span>
                          <span className="text-[9px] text-slate-400 block">Identité membre confidentielle</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                          <span>Progression : {progressPercent}%</span>
                          <span>Livraison : <strong className="text-slate-900">{m.deliveryStatus || 'À l’échéance de votre tour'}</strong></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-slate-900 to-[#C5A059] h-full rounded-full transition-all"
                            style={{ width: `${Math.max(3, progressPercent)}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. MES PAIEMENTS (HISTORIQUE UNIFIÉ) */}
        {/* ============================================================== */}
        {activeSection === 'payments' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Historique unifié de vos paiements ({unifiedPayments.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tous vos versements enregistrés pour vos achats échelonnés et vos tontines.</p>
            </div>

            {unifiedPayments.length === 0 ? (
              <EmptyState
                icon={<Banknote className="w-8 h-8 text-slate-400" />}
                title="Aucun paiement enregistré"
                description="Vos versements Mobile Money ou espèces s'afficheront ici avec reçu."
              />
            ) : (
              <div className="space-y-3">
                {unifiedPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">{formatFCFA(p.amount)}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {p.reference}
                        </span>
                        <Badge variant={p.sourceType === 'installment' ? 'gold' : 'blue'} size="sm">
                          {p.sourceType === 'installment' ? 'Échelonné' : 'Tontine'}
                        </Badge>
                        <Badge variant="green" size="sm">Validé ✓</Badge>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {p.sourceTitle} · {p.sourceCodeOrRef}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Canal : {p.method.toUpperCase()} · Le {formatDate(p.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        Certifié dans Firebase
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. MES LIVRAISONS */}
        {/* ============================================================== */}
        {activeSection === 'deliveries' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Suivi de vos livraisons ({unifiedDeliveries.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Acheminement de vos équipements commandés, soldés ou attribués par tontine.</p>
            </div>

            {unifiedDeliveries.length === 0 ? (
              <EmptyState
                icon={<Truck className="w-8 h-8 text-slate-400" />}
                title="Aucune livraison en cours"
                description="Dès qu'un contrat est soldé à 100%, qu'une commande est validée ou que votre tour de tontine arrive, le suivi apparaît ici."
              />
            ) : (
              <div className="space-y-4">
                {unifiedDeliveries.map((del) => {
                  const getStatusBadge = (status: UnifiedDeliveryItem['status']) => {
                    switch (status) {
                      case 'delivered':
                        return <Badge variant="green" dot>Livré avec succès</Badge>;
                      case 'shipped':
                        return <Badge variant="blue" dot>En acheminement</Badge>;
                      case 'scheduled':
                        return <Badge variant="gold" dot>Programmée</Badge>;
                      default:
                        return <Badge variant="slate" dot>En préparation</Badge>;
                    }
                  };

                  return (
                    <div key={del.id} className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{del.sourceTitle}</span>
                          {getStatusBadge(del.status)}
                        </div>
                        <span className="text-xs text-slate-400">Enregistré le {formatDate(del.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {del.productImage ? (
                          <img src={del.productImage} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{del.productName}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>Destination : <strong>{del.destinationCommune}</strong> - {del.destinationAddress}</span>
                          </p>
                        </div>
                      </div>

                      {/* Timeline 4 Steps */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-0.5">
                          <span className="font-bold block text-[10px]">1. Validation</span>
                          <p className="text-[10px] text-emerald-700">Commande ou solde 100%</p>
                        </div>

                        <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                          del.status !== 'pending' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <span className="font-bold block text-[10px]">2. Préparation</span>
                          <p className="text-[10px] text-slate-500">Contrôle technique</p>
                        </div>

                        <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                          del.status === 'shipped' || del.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <span className="font-bold block text-[10px]">3. Expédition</span>
                          <p className="text-[10px] text-slate-500">Livreur en route</p>
                        </div>

                        <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                          del.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <span className="font-bold block text-[10px]">4. Réception</span>
                          <p className="text-[10px] text-slate-500">Déballage & Garantie</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. MES INFORMATIONS (PROFIL & COORDONNÉES) */}
        {/* ============================================================== */}
        {activeSection === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs max-w-2xl space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
                Profil Client Certifié
              </span>
              <h3 className="font-bold text-base text-slate-900 tracking-tight mt-0.5">
                Mes Coordonnées & Informations Contractuelles
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ces informations sont nécessaires pour éditer vos contrats échelonnés et assurer la livraison à domicile à Abidjan ou en région.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Identifiant client (ID)</span>
                <span className="font-mono text-slate-900 font-bold">{user.uid}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Statut</span>
                <Badge variant="green" dot>{customer?.statut || 'Actif'}</Badge>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Nom et Prénom *"
                required
                value={profileForm.nom}
                onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Numéro de Téléphone *"
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Numéro WhatsApp de notification"
                  type="tel"
                  value={profileForm.whatsapp}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Commune *"
                  required
                  value={profileForm.commune}
                  onChange={(e) => setProfileForm({ ...profileForm, commune: e.target.value })}
                />

                <Input
                  label="Adresse / Localisation précise de livraison *"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sécurité des données & Authentification Firebase</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Authentifié avec : <strong className="text-slate-800">{user.email}</strong>. Aucun mot de passe n'est stocké en clair.
                </p>
                <p className="text-[11px] text-slate-400">
                  Date de création : {formatDate(customer?.createdAt || new Date().toISOString())}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={savingProfile}
                  leftIcon={<Save className="w-4 h-4 text-[#C5A059]" />}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED ON SMARTPHONE) */}
      {/* ============================================================== */}
      <nav 
        aria-label="Navigation Espace Client" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {[
          { id: 'overview', label: 'Accueil', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'installments', label: 'Échelonné', icon: <CreditCard className="w-5 h-5" /> },
          { id: 'tontines', label: 'Tontines', icon: <Users className="w-5 h-5" /> },
          { id: 'deliveries', label: 'Livraisons', icon: <Truck className="w-5 h-5" /> },
          { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-5 h-5" /> },
          { id: 'profile', label: 'Profil', icon: <User className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as PortalSection);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
                isActive ? 'text-[#9A7426] font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      {selectedContractForPayment && (
        <InstallmentPaymentModal
          contract={selectedContractForPayment}
          isOpen={!!selectedContractForPayment}
          onClose={() => setSelectedContractForPayment(null)}
          onPaymentSuccess={loadData}
        />
      )}

      {selectedTontineForPayment && (
        <TontineContributionModal
          member={selectedTontineForPayment}
          groupCode={selectedTontineForPayment.group?.groupCode}
          isOpen={!!selectedTontineForPayment}
          onClose={() => setSelectedTontineForPayment(null)}
          onSuccess={loadData}
        />
      )}

    </div>
  );
};
