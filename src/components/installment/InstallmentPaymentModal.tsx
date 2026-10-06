import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  Banknote,
  ArrowRight,
  Info
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { InstallmentContract, InstallmentPayment } from '../../types';
import { installmentService } from '../../services/installmentService';
import { formatFCFA } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface InstallmentPaymentModalProps {
  contract: InstallmentContract;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  isAdmin?: boolean;
}

export const InstallmentPaymentModal: React.FC<InstallmentPaymentModalProps> = ({
  contract,
  isOpen,
  onClose,
  onPaymentSuccess,
  isAdmin = false,
}) => {
  const { showToast } = useToast();

  const suggestedAmount = Math.min(
    contract.remainingAmount > 0 ? contract.remainingAmount : contract.monthlyPayment,
    contract.remainingAmount
  );

  const [amount, setAmount] = useState<number>(suggestedAmount || contract.monthlyPayment);
  const [method, setMethod] = useState<InstallmentPayment['method']>('wave');
  const [reference, setReference] = useState<string>(`TX-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const paymentMethods: { id: InstallmentPayment['method']; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'wave', label: 'Wave', icon: <Smartphone className="w-4 h-4 text-sky-500" />, desc: 'Paiement instantané sans frais' },
    { id: 'orange_money', label: 'Orange Money', icon: <Smartphone className="w-4 h-4 text-orange-500" />, desc: '#144# ou App Orange Money' },
    { id: 'mtn_momo', label: 'MTN MoMo', icon: <Smartphone className="w-4 h-4 text-yellow-500" />, desc: '*133# Mobile Money' },
    { id: 'moov_money', label: 'Moov Money', icon: <Smartphone className="w-4 h-4 text-blue-500" />, desc: '*155# Flooz' },
    { id: 'cash', label: 'Espèces Showroom', icon: <Banknote className="w-4 h-4 text-emerald-600" />, desc: 'Caisse centrale PENTA GAD' },
    { id: 'bank_transfer', label: 'Virement bancaire', icon: <Building2 className="w-4 h-4 text-slate-700" />, desc: 'RIB bancaire CI' },
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
      const payment = await installmentService.recordPayment({
        contractId: contract.id,
        customerId: contract.customerId,
        amount: Number(amount),
        method,
        reference: reference.trim(),
        recordedBy: isAdmin ? 'admin (pentagad.distribution@gmail.com)' : 'client',
        status: 'approved', // Validated in demo / instant integration workflow
        notes: notes.trim(),
      });

      const newRemaining = Math.max(0, contract.remainingAmount - amount);
      const isCompleted = newRemaining <= 0;

      showToast({
        type: 'success',
        title: isCompleted ? 'Félicitations ! Contrat soldé à 100%' : 'Versement enregistré avec succès',
        message: isCompleted
          ? `Votre équipement ${contract.productSnapshot.name} est intégralement payé. Le processus de livraison est maintenant déclenché.`
          : `Versement de ${formatFCFA(amount)} validé. Réf : ${payment.reference}`,
      });

      onPaymentSuccess();
      onClose();
    } catch (err) {
      console.error('Payment error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d’enregistrer le versement.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Régler une échéance"
      subtitle={`Contrat ${contract.contractNumber || contract.id.slice(0, 8)} · ${contract.productSnapshot.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Financial Recap Strip */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Solde actuel à solder :</span>
            <p className="font-extrabold text-slate-900 text-sm">{formatFCFA(contract.remainingAmount)}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium">Mensualité prévue :</span>
            <p className="font-bold text-slate-800">{formatFCFA(contract.monthlyPayment)}</p>
          </div>
        </div>

        {/* Method selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 tracking-tight">
            Canal de règlement Mobile Money / Caisse
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {paymentMethods.map((m) => {
              const isSelected = method === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950 text-slate-950 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="mt-0.5">{m.icon}</span>
                  <div>
                    <span className="block leading-tight text-xs">{m.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal leading-tight block mt-0.5">{m.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 tracking-tight">
              Montant du versement (FCFA) *
            </label>
            <button
              type="button"
              onClick={() => setAmount(contract.remainingAmount)}
              className="text-[11px] text-[#9A7426] hover:underline font-bold"
            >
              Solder la totalité ({formatFCFA(contract.remainingAmount)})
            </button>
          </div>
          <Input
            type="number"
            required
            min={1000}
            max={contract.remainingAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder={contract.monthlyPayment.toString()}
          />
        </div>

        {/* Reference Input */}
        <Input
          label="Référence de la transaction / Reçu *"
          required
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex: WAVE-TX-482910 ou reçu de caisse"
          helperText="Chaque paiement est tracé individuellement et certifié dans Firebase."
        />

        {/* Notes */}
        <Input
          label="Remarque ou contact de l'expéditeur"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Versé par Jean Kouadio"
        />

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Architecture sécurisée prête pour passerelle PayDunya / Mobile Money API directe. Dès validation du paiement, le solde et la progression du contrat sont mis à jour en temps réel.
          </p>
        </div>

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
            Valider le versement
          </Button>
        </div>

      </form>
    </Modal>
  );
};
