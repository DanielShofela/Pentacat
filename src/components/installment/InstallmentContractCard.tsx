import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  History, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  MapPin, 
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { InstallmentContract, InstallmentPayment, InstallmentDeliveryStatus } from '../../types';
import { installmentService } from '../../services/installmentService';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InstallmentPaymentModal } from './InstallmentPaymentModal';
import { useToast } from '../../context/ToastContext';

interface InstallmentContractCardProps {
  contract: InstallmentContract;
  onRefresh: () => void;
  isAdmin?: boolean;
}

export const InstallmentContractCard: React.FC<InstallmentContractCardProps> = ({
  contract,
  onRefresh,
  isAdmin = false,
}) => {
  const [payments, setPayments] = useState<InstallmentPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  const { showToast } = useToast();

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await installmentService.getContractPayments(contract.id);
      setPayments(data);
    } catch (err) {
      console.warn('Error loading payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadPayments();
    }
  }, [showHistory, contract.id]);

  const handleUpdateDeliveryStatus = async (status: InstallmentDeliveryStatus) => {
    setUpdatingDelivery(true);
    try {
      await installmentService.updateDeliveryStatus(contract.id, status);
      showToast({
        type: 'success',
        title: 'Livraison mise à jour',
        message: `Le statut de livraison est passé à : ${getDeliveryLabel(status)}`,
      });
      onRefresh();
    } catch (err) {
      console.error('Delivery status update error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de modifier le statut de livraison.',
      });
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const getStatusBadge = (status: InstallmentContract['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="slate" dot>En attente</Badge>;
      case 'active':
        return <Badge variant="blue" dot>En cours</Badge>;
      case 'completed':
        return <Badge variant="green" dot>Soldé à 100%</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" dot>Annulé</Badge>;
      case 'overdue':
        return <Badge variant="gold" dot>En retard</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getDeliveryLabel = (status?: InstallmentDeliveryStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente d’expédition';
      case 'scheduled':
        return 'Programmé pour livraison';
      case 'shipped':
        return 'En cours d’acheminement';
      case 'delivered':
        return 'Matériel livré avec succès';
      default:
        return 'Non déclenchée (contrat en cours)';
    }
  };

  const isCompleted = contract.status === 'completed' || contract.amountPaid >= contract.totalAmount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-5">
      
      {/* Top Bar: Contract Number + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {contract.contractNumber || contract.id.slice(0, 10)}
          </span>
          {getStatusBadge(contract.status)}
          <span className="text-xs text-slate-400 hidden sm:inline">
            Créé le {formatDate(contract.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#C5A059]" />}
            >
              Effectuer un versement
            </Button>
          )}

          {isAdmin && isCompleted && (
            <select
              value={contract.deliveryStatus || 'pending'}
              disabled={updatingDelivery}
              onChange={(e) => handleUpdateDeliveryStatus(e.target.value as InstallmentDeliveryStatus)}
              className="text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="pending">Livraison : En attente</option>
              <option value="scheduled">Livraison : Programmée</option>
              <option value="shipped">Livraison : En acheminement</option>
              <option value="delivered">Livraison : Livré</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Info: Product + Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Product Snapshot */}
        <div className="md:col-span-5 flex items-center gap-4">
          {contract.productSnapshot.imageUrl ? (
            <img
              src={contract.productSnapshot.imageUrl}
              alt={contract.productSnapshot.name}
              className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
            />
          ) : (
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <Package className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {contract.productSnapshot.brand} · Réf : <span className="font-mono">{contract.productSnapshot.reference}</span>
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
              {contract.productSnapshot.name}
            </h3>
            <p className="text-xs font-bold text-slate-500">
              Étalement sur {contract.duration} mois ({formatFCFA(contract.monthlyPayment)} / mois)
            </p>
          </div>
        </div>

        {/* 4 Key Figures */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Prix Total</span>
            <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
              {formatFCFA(contract.totalAmount)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block font-medium">Total Payé</span>
            <span className="text-sm font-black text-emerald-800 block mt-0.5">
              {formatFCFA(contract.amountPaid)}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-amber-800 block font-medium">Solde Restant</span>
            <span className="text-sm font-black text-amber-900 block mt-0.5">
              {formatFCFA(contract.remainingAmount)}
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <CreditCard className="w-4 h-4 text-[#C5A059]" />
            <span>Progression du règlement</span>
          </div>
          <span className="font-black text-slate-900 text-xs sm:text-sm">
            {contract.progressPercentage}% complété
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-[#C5A059]'
            }`}
            style={{ width: `${Math.max(2, contract.progressPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span>Début : {formatDate(contract.startDate)}</span>
          {!isCompleted && contract.nextPaymentDueDate && (
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C5A059]" />
              Prochaine échéance : {formatDate(contract.nextPaymentDueDate)}
            </span>
          )}
          <span>Fin prévue : {formatDate(contract.expectedEndDate)}</span>
        </div>
      </div>

      {/* Delivery Process Banner (Active when completed or pending delivery) */}
      {isCompleted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Processus de Livraison PENTA GAD
                </h4>
                <p className="text-xs text-emerald-700">
                  Statut actuel : <strong className="underline">{getDeliveryLabel(contract.deliveryStatus)}</strong>
                </p>
              </div>
            </div>

            <Badge variant="green" dot>
              {contract.deliveryStatus === 'delivered' ? 'Livré' : 'En cours de traitement logistique'}
            </Badge>
          </div>

          {/* Delivery Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-emerald-900 space-y-0.5">
              <span className="font-bold block text-[11px]">1. Contrat Soldé</span>
              <p className="text-[10px] text-emerald-700">Règlement intégral validé</p>
            </div>

            <div className={`p-2.5 rounded-xl border space-y-0.5 ${
              contract.deliveryStatus ? 'bg-white/80 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold block text-[11px]">2. Préparation</span>
              <p className="text-[10px] text-slate-500">Contrôle technique & emballage</p>
            </div>

            <div className={`p-2.5 rounded-xl border space-y-0.5 ${
              contract.deliveryStatus === 'shipped' || contract.deliveryStatus === 'delivered'
                ? 'bg-white/80 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold block text-[11px]">3. Expédition</span>
              <p className="text-[10px] text-slate-500">Prise en charge livreur PENTA</p>
            </div>

            <div className={`p-2.5 rounded-xl border space-y-0.5 ${
              contract.deliveryStatus === 'delivered'
                ? 'bg-white/80 border-emerald-200 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="font-bold block text-[11px]">4. Réception</span>
              <p className="text-[10px] text-slate-500">Déballage & Garantie signée</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 pt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Adresse de destination :{' '}
              <strong>{contract.deliveryCommune || 'Abidjan'} - {contract.deliveryAddress || 'Showroom PENTA GAD'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Accordion: Payments History Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-950 py-1 transition-colors"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Historique des paiements ({contract.amountPaid > 0 ? 'Tracabilité certifiée' : 'Aucun versement'})</span>
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
            {loadingPayments ? (
              <div className="p-4 text-center text-xs text-slate-400">Chargement des paiements...</div>
            ) : payments.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                Aucun paiement n’a encore été enregistré pour ce contrat.
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatFCFA(p.amount)}</span>
                        <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                          {p.reference}
                        </span>
                        <Badge variant={p.status === 'approved' ? 'green' : 'slate'} size="sm">
                          {p.status === 'approved' ? 'Validé' : p.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {p.method.toUpperCase()} · Enregistré par : {p.recordedBy} · {formatDate(p.date || p.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-emerald-700">✓ Enregistré</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <InstallmentPaymentModal
          contract={contract}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={() => {
            onRefresh();
            if (showHistory) loadPayments();
          }}
          isAdmin={isAdmin}
        />
      )}

    </div>
  );
};
