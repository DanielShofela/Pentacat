import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  History, 
  ShieldCheck,
  Package
} from 'lucide-react';
import { installmentService } from '../../services/installmentService';
import { InstallmentContract, InstallmentDeliveryStatus } from '../../types';
import { formatFCFA, formatDate, sanitizePhoneForWhatsApp } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { InstallmentPaymentModal } from '../installment/InstallmentPaymentModal';
import { useToast } from '../../context/ToastContext';

export const InstallmentListAdmin: React.FC = () => {
  const [contracts, setContracts] = useState<InstallmentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const [selectedContractForPayment, setSelectedContractForPayment] = useState<InstallmentContract | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await installmentService.getAllContracts();
      setContracts(data);
    } catch (err) {
      console.warn('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleDeliveryStatusChange = async (contractId: string, deliveryStatus: InstallmentDeliveryStatus) => {
    setUpdatingId(contractId);
    try {
      await installmentService.updateDeliveryStatus(contractId, deliveryStatus);
      setContracts(prev => prev.map(c => c.id === contractId ? { ...c, deliveryStatus } : c));
      showToast({
        type: 'success',
        title: 'Statut de livraison mis à jour',
        message: `Livraison passée au statut : ${deliveryStatus}`,
      });
    } catch (err) {
      console.error('Update delivery status error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de changer le statut de livraison.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch = 
      (c.contractNumber && c.contractNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.customerName && c.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (c.customerPhone && c.customerPhone.includes(search)) ||
      c.productSnapshot.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
              Gestion des Facilités de Paiement
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Contrats Échelonnés & Échéanciers ({contracts.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Superviser les versements Mobile Money, recalculer les soldes certifiés et déclencher les livraisons.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadContracts}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-700" />}
        >
          Actualiser
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Rechercher par numéro de contrat, client, téléphone, équipement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'active', label: 'En cours' },
              { value: 'completed', label: 'Soldé à 100%' },
              { value: 'overdue', label: 'En retard' },
              { value: 'cancelled', label: 'Annulé' },
            ]}
          />
        </div>
      </div>

      {/* List */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-slate-400" />}
          title="Aucun contrat échelonné"
          description={
            search || filterStatus !== 'all'
              ? 'Aucun contrat ne correspond à vos filtres actuels.'
              : 'Les contrats souscrits par les clients s\'afficheront ici en temps réel.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((ctr) => {
            const cleanPhone = sanitizePhoneForWhatsApp(ctr.customerPhone || '');
            const clientWhatsAppUrl = `https://wa.me/${cleanPhone}`;
            const isCompleted = ctr.status === 'completed' || ctr.amountPaid >= ctr.totalAmount;

            return (
              <div
                key={ctr.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {ctr.contractNumber || ctr.id.slice(0, 8)}
                    </span>
                    {getStatusBadge(ctr.status)}
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Créé le {formatDate(ctr.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedContractForPayment(ctr)}
                      leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#C5A059]" />}
                    >
                      Enregistrer versement
                    </Button>

                    {isCompleted && (
                      <select
                        value={ctr.deliveryStatus || 'pending'}
                        disabled={updatingId === ctr.id}
                        onChange={(e) => handleDeliveryStatusChange(ctr.id, e.target.value as InstallmentDeliveryStatus)}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Client Info */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Souscripteur
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{ctr.customerName || 'Client PENTA GAD'}</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ctr.customerPhone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{ctr.deliveryCommune || 'Abidjan'} - {ctr.deliveryAddress || 'Showroom'}</span>
                    </div>

                    <div className="pt-2">
                      <a
                        href={clientWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Échanger sur WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Équipement financé
                    </span>
                    <p className="font-bold text-slate-900">{ctr.productSnapshot.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {ctr.productSnapshot.brand} · Réf : {ctr.productSnapshot.reference}
                    </p>
                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      Formule : <strong>{ctr.duration} mois</strong> ({formatFCFA(ctr.monthlyPayment)} / mois)
                    </p>
                  </div>

                  {/* Financial Status */}
                  <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Prix total :</span>
                      <strong className="text-slate-900">{formatFCFA(ctr.totalAmount)}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Total payé :</span>
                      <strong className="text-emerald-800 font-black">{formatFCFA(ctr.amountPaid)}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-800">Solde restant :</span>
                      <strong className="text-amber-900 font-black">{formatFCFA(ctr.remainingAmount)}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progression</span>
                        <span className="font-bold text-slate-700">{ctr.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-slate-950'
                          }`}
                          style={{ width: `${Math.max(2, ctr.progressPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isCompleted && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>
                        Contrat soldé à 100%. Processus logistique :{' '}
                        <strong>{ctr.deliveryStatus || 'pending'}</strong>
                      </span>
                    </div>
                    <span className="font-bold text-[11px] text-emerald-700">
                      Adresse : {ctr.deliveryCommune} - {ctr.deliveryAddress}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedContractForPayment && (
        <InstallmentPaymentModal
          contract={selectedContractForPayment}
          isOpen={!!selectedContractForPayment}
          onClose={() => setSelectedContractForPayment(null)}
          onPaymentSuccess={() => {
            loadContracts();
          }}
          isAdmin={true}
        />
      )}
    </div>
  );
};
