import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck,
  Settings
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { tontineService } from '../../services/tontineService';
import { useToast } from '../../context/ToastContext';

interface TontineCreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TontineCreateGroupModal: React.FC<TontineCreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [suggestedCode, setSuggestedCode] = useState<string>('TG-001');
  const [name, setName] = useState<string>('Groupe Confort Électroménager PENTA');
  const [description, setDescription] = useState<string>('Tontine rotative d\'équipement électroménager à 0% d\'intérêt.');
  
  // Configurable parameters (NEVER hardcoded!)
  const [memberCount, setMemberCount] = useState<number>(10);
  const [rotationPeriodDays, setRotationPeriodDays] = useState<number>(10);
  const [totalDurationDays, setTotalDurationDays] = useState<number>(110);
  const [contributionFrequency, setContributionFrequency] = useState<'daily' | 'per_period' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCode() {
      const code = await tontineService.generateNextGroupCode();
      setSuggestedCode(code);
    }
    if (isOpen) {
      loadCode();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Veuillez renseigner un nom pour le groupe.');
      return;
    }

    setLoading(true);
    try {
      const group = await tontineService.createTontineGroup({
        name: name.trim(),
        description: description.trim(),
        memberCount: Number(memberCount),
        rotationPeriodDays: Number(rotationPeriodDays),
        totalDurationDays: Number(totalDurationDays),
        contributionFrequency,
        startDate,
        allowCustomProducts: true,
      });

      showToast({
        type: 'success',
        title: 'Groupe Tontine créé avec succès',
        message: `Code : ${group.groupCode} · ${group.name} (${group.memberCount} membres).`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating tontine group:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Impossible de créer le groupe.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un nouveau Groupe Tontine"
      subtitle={`Identifiant officiel généré : ${suggestedCode}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Code Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Identifiant stable du groupe</span>
            <span className="font-mono font-black text-slate-900 text-sm">{suggestedCode}</span>
          </div>
          <span className="text-[11px] text-slate-500">Numéro séquentiel unique</span>
        </div>

        {/* Name */}
        <Input
          label="Nom du groupe *"
          required
          placeholder="Ex: Groupe Confort Électroménager #01"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Description */}
        <Input
          label="Description / Objectif"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Épargne collective pour téléviseurs, splits et réfrigérateurs"
        />

        {/* Configurable Parameters Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Settings className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Paramètres de Rotation & Règles Métier</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre de membres *"
              type="number"
              required
              min={2}
              max={50}
              value={memberCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setMemberCount(count);
                setTotalDurationDays(count * rotationPeriodDays + 10);
              }}
              helperText="Défaut : 10 personnes"
            />

            <Input
              label="Période de rotation (jours) *"
              type="number"
              required
              min={1}
              max={60}
              value={rotationPeriodDays}
              onChange={(e) => {
                const period = Number(e.target.value);
                setRotationPeriodDays(period);
                setTotalDurationDays(memberCount * period + 10);
              }}
              helperText="Défaut : 10 jours"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Durée globale du cycle (jours) *"
              type="number"
              required
              min={10}
              value={totalDurationDays}
              onChange={(e) => setTotalDurationDays(Number(e.target.value))}
              helperText="Défaut : 110 jours"
            />

            <Select
              label="Fréquence de cotisation *"
              options={[
                { value: 'daily', label: 'Journalière (Tous les jours)' },
                { value: 'per_period', label: 'Par période (Tous les 10 jours)' },
                { value: 'monthly', label: 'Mensuelle' },
              ]}
              value={contributionFrequency}
              onChange={(e) => setContributionFrequency(e.target.value as any)}
            />
          </div>

          <Input
            label="Date de début du cycle *"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Chaque membre pourra choisir son équipement électroménager spécifique.</span>
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
            leftIcon={<PlusCircle className="w-4 h-4 text-[#C5A059]" />}
          >
            Créer le groupe
          </Button>
        </div>

      </form>
    </Modal>
  );
};
