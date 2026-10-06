import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Smartphone, 
  Banknote, 
  Building2, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TontineMember, TontineContribution, TontineContributionType } from '../../types';
import { tontineService } from '../../services/tontineService';
import { formatFCFA } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface TontineContributionModalProps {
  member: TontineMember;
  groupCode?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export const TontineContributionModal: React.FC<TontineContributionModalProps> = ({
  member,
  groupCode,
  isOpen,
  onClose,
  onSuccess,
  isAdmin = false,
}) => {
  const { showToast } = useToast();

  const suggestedAmount = member.dailyAmount || Math.round(member.expectedContribution / 10);

  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [method, setMethod] = useState<TontineContribution['method']>('wave');
  const [paymentType, setPaymentType] = useState<TontineContributionType>('daily');
  const [reference, setReference] = useState<string>(`TNT-TX-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const paymentMethods: { id: TontineContribution['method']; label: string; icon: React.ReactNode }[] = [
    { id: 'wave', label: 'Wave', icon: <Smartphone className="w-4 h-4 text-sky-500" /> },
    { id: 'orange_money', label: 'Orange Money', icon: <Smartphone className="w-4 h-4 text-orange-500" /> },
    { id: 'mtn_momo', label: 'MTN MoMo', icon: <Smartphone className="w-4 h-4 text-yellow-500" /> },
    { id: 'moov_money', label: 'Moov Money', icon: <Smartphone className="w-4 h-4 text-blue-500" /> },
    { id: 'cash', label: 'Espèces Showroom', icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
    { id: 'bank_transfer', label: 'Virement', icon: <Building2 className="w-4 h-4 text-slate-700" /> },
  ];

  const paymentTypeOptions = [
    { value: 'daily', label: 'Cotisation Journalière' },
    { value: 'grouped', label: 'Paiement Groupé (Période complète)' },
    { value: 'partial', label: 'Paiement Partiel' },
    { value: 'regularization', label: 'Régularisation' },
    { value: 'late', label: 'Rattrapage de retard' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Veuillez saisir un montant valide.');
      return;
    }
    if (!reference.trim()) {
      alert('Veuillez renseigner la référence de transaction.');
      return;
    }

    setLoading(true);
    try {
      const contribution = await tontineService.recordContribution({
        groupId: member.groupId,
        memberId: member.id,
        customerId: member.customerId,
        amount: Number(amount),
        method,
        paymentType,
        reference: reference.trim(),
        recordedBy: isAdmin ? 'admin (pentagad.distribution@gmail.com)' : 'client',
        notes: notes.trim(),
        status: 'approved',
      });

      showToast({
        type: 'success',
        title: 'Cotisation tontine validée',
        message: `${formatFCFA(amount)} enregistré pour ${member.customerName} (Tour #${member.position}).`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Tontine contribution error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d’enregistrer la cotisation.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer une cotisation Tontine"
      subtitle={`${member.customerName} · Tour #${member.position} · ${groupCode || ''}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Member Financial Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Équipement choisi :</span>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
              {member.productSnapshot.name}
            </p>
            <span className="text-[11px] text-slate-400">Total : {formatFCFA(member.expectedContribution)}</span>
          </div>
          <div className="text-right">
            <span className="text-emerald-700 font-medium">Déjà versé :</span>
            <p className="font-bold text-emerald-800">{formatFCFA(member.totalContributed)}</p>
            <span className="text-[11px] text-amber-800">Reste : {formatFCFA(member.remainingAmount)}</span>
          </div>
        </div>

        {/* Payment Type */}
        <Select
          label="Type de cotisation *"
          options={paymentTypeOptions}
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as TontineContributionType)}
        />

        {/* Method selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 tracking-tight">
            Canal de paiement
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {paymentMethods.map((m) => {
              const isSelected = method === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950 text-slate-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {m.icon}
                  <span className="text-[11px] leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-800 tracking-tight">
              Montant versé (FCFA) *
            </label>
            <div className="flex gap-2 text-[11px]">
              {member.dailyAmount && (
                <button
                  type="button"
                  onClick={() => setAmount(member.dailyAmount!)}
                  className="text-slate-600 hover:text-slate-900 font-semibold underline"
                >
                  1 jour ({formatFCFA(member.dailyAmount)})
                </button>
              )}
              <button
                type="button"
                onClick={() => setAmount(member.remainingAmount)}
                className="text-[#9A7426] hover:underline font-bold"
              >
                Solde ({formatFCFA(member.remainingAmount)})
              </button>
            </div>
          </div>
          <Input
            type="number"
            required
            min={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="1500"
          />
        </div>

        {/* Reference Input */}
        <Input
          label="Référence de la transaction / Reçu Mobile Money *"
          required
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex: WAVE-CI-994420 ou reçu caisse"
          helperText="Chaque paiement est certifié et auditable dans Firestore."
        />

        {/* Notes */}
        <Input
          label="Remarques (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Reçu délivré au showroom PENTA GAD"
        />

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-[#C5A059]" />}
          >
            Valider la cotisation
          </Button>
        </div>

      </form>
    </Modal>
  );
};
