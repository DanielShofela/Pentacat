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
  Clock, 
  AlertCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { orderService } from '../../services/orderService';
import { installmentService } from '../../services/installmentService';
import { tontineService } from '../../services/tontineService';
import { Order, InstallmentContract, TontineMember } from '../../types';
import { formatFCFA, formatDate } from '../../utils/formatters';

export const CustomerPortalOverview: React.FC = () => {
  const { user, customer, logout } = useAuth();
  const { setIsAuthModalOpen, setActiveDomain } = useAppNavigation();

  const [activeTab, setActiveTab] = useState<'orders' | 'contracts' | 'tontines' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<InstallmentContract[]>([]);
  const [memberships, setMemberships] = useState<TontineMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    async function loadUserData() {
      setLoading(true);
      try {
        const [userOrders, userContracts, userMemberships] = await Promise.all([
          orderService.getCustomerOrders(uid).catch(() => []),
          installmentService.getCustomerContracts(uid).catch(() => []),
          tontineService.getCustomerMemberships(uid).catch(() => []),
        ]);
        setOrders(userOrders);
        setContracts(userContracts);
        setMemberships(userMemberships);
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Espace Client PENTA GAD</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Connectez-vous pour consulter le suivi de vos commandes, l'état d'avancement de vos contrats échelonnés et vos groupes de tontine.
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>Se connecter avec Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20">
      
      {/* Customer Header Summary */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md uppercase">
            {customer?.fullName ? customer.fullName.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {customer?.fullName || user.displayName || 'Client PENTA GAD'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                Client Vérifié
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-400">{customer?.city || 'Abidjan'} • Côte d'Ivoire</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Client Sub-sections */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes Directes ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'contracts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Contrats Échelonnés ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tontines')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tontines'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mes Tontines ({memberships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mes Informations</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Classic Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-semibold text-xs text-slate-700">Aucune commande directe enregistrée</h4>
                <p className="text-xs text-slate-400">Vos commandes passées avec votre compte apparaîtront ici.</p>
                <button
                  onClick={() => setActiveDomain('store')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold"
                >
                  Découvrir les produits
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-400 ml-2">• {formatDate(ord.createdAt)}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>{it.productName} (x{it.quantity})</span>
                          <span className="font-semibold">{formatFCFA(it.totalPrice)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Total réglé / à régler :</span>
                      <span className="font-extrabold text-sm text-slate-900">{formatFCFA(ord.grandTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Installment Contracts */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-semibold text-xs text-slate-700">Aucun contrat de paiement échelonné actif</h4>
                <p className="text-xs text-slate-400">Équipez votre maison et étalez vos mensualités sans contrainte.</p>
                <button
                  onClick={() => setActiveDomain('installment')}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Simuler un contrat échelonné
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((ctr) => (
                  <div key={ctr.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{ctr.productName}</h4>
                        <p className="text-[11px] text-slate-500">Réf contrat : {ctr.contractNumber}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {ctr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Valeur totale :</span>
                        <p className="font-bold text-slate-900">{formatFCFA(ctr.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Acompte versé :</span>
                        <p className="font-bold text-emerald-700">{formatFCFA(ctr.depositAmount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Solde restant :</span>
                        <p className="font-bold text-amber-800">{formatFCFA(ctr.remainingBalance)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Mensualité :</span>
                        <p className="font-black text-slate-900">{formatFCFA(ctr.monthlyPayment)} / mois</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tontines */}
        {activeTab === 'tontines' && (
          <div className="space-y-4">
            {memberships.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-semibold text-xs text-slate-700">Vous ne participez à aucune tontine</h4>
                <p className="text-xs text-slate-400">Rejoignez un groupe rotatif pour obtenir vos équipements à 0% d'intérêt.</p>
                <button
                  onClick={() => setActiveDomain('tontine')}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold"
                >
                  Voir les tontines ouvertes
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {memberships.map((m) => (
                  <div key={m.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Groupe Tontine PENTA GAD</h4>
                      <p className="text-[11px] text-slate-500">Position attribuée : Tour #{m.assignedPosition}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Informations Personnelles Enregistrées</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Nom complet</span>
                  <span className="font-bold text-slate-800">{customer?.fullName || '-'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Email de connexion</span>
                  <span className="font-bold text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Téléphone / WhatsApp</span>
                  <span className="font-bold text-slate-800">{customer?.phone || 'Non renseigné'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Ville de résidence</span>
                  <span className="font-bold text-slate-800">{customer?.city || 'Abidjan, Côte d\'Ivoire'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
