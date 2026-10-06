import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck,
  Package
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { TontineMember, TontineDeliveryStatus } from '../../types';
import { tontineService } from '../../services/tontineService';
import { formatFCFA } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface TontineDeliveryModalProps {
  member: TontineMember;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TontineDeliveryModal: React.FC<TontineDeliveryModalProps> = ({
  member,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [deliveryStatus, setDeliveryStatus] = useState<TontineDeliveryStatus>(
    member.deliveryStatus === 'not_eligible' ? 'pending' : member.deliveryStatus
  );
  const [address, setAddress] = useState<string>(member.deliveryAddress || '');
  const [commune, setCommune] = useState<string>(member.deliveryCommune || 'Cocody');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tontineService.updateMemberDeliveryStatus(member.id, deliveryStatus);
      showToast({
        type: 'success',
        title: 'Livraison du membre mise à jour',
        message: `Statut : ${deliveryStatus} pour ${member.customerName}.`,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating delivery status:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour la livraison.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Organiser la Livraison du Bénéficiaire"
      subtitle={`${member.customerName} · Position #${member.position} · ${member.productSnapshot.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Product snapshot */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
          {member.productSnapshot.imageUrl ? (
            <img src={member.productSnapshot.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <Package className="w-8 h-8 text-slate-400" />
          )}
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">
              {member.productSnapshot.brand} · Réf: {member.productSnapshot.reference}
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{member.productSnapshot.name}</h4>
            <span className="text-xs font-black text-slate-950">{formatFCFA(member.expectedContribution)}</span>
          </div>
        </div>

        {/* Delivery Status selector */}
        <Select
          label="Statut du processus logistique *"
          options={[
            { value: 'pending', label: '1. En attente de préparation showroom' },
            { value: 'scheduled', label: '2. Programmée avec le transporteur' },
            { value: 'shipped', label: '3. En cours d’acheminement (En route)' },
            { value: 'delivered', label: '4. Livré & Déballé à domicile' },
          ]}
          value={deliveryStatus}
          onChange={(e) => setDeliveryStatus(e.target.value as TontineDeliveryStatus)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Commune"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
          />

          <Input
            label="Adresse de livraison"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Angré 8ème tranche"
          />
        </div>

        <Input
          label="Instructions logistiques / Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Livreur affecté : Traoré (07 00 00 00)"
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
            leftIcon={<Truck className="w-4 h-4 text-[#C5A059]" />}
          >
            Enregistrer le statut
          </Button>
        </div>

      </form>
    </Modal>
  );
};
