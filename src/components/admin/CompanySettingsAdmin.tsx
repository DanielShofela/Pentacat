import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Truck, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import { useCompanySettings } from '../../context/CompanySettingsContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const CompanySettingsAdmin: React.FC = () => {
  const { settings, updateSettings, cleanWhatsAppNumber, buildWhatsAppUrl } = useCompanySettings();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: settings.name,
    whatsappNumber: settings.whatsappNumber,
    phoneDisplay: settings.phoneDisplay,
    email: settings.email,
    address: settings.address,
    openingHours: settings.openingHours,
    standardDeliveryFee: settings.standardDeliveryFee,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings(form);
      setSuccess(true);
      showToast({
        type: 'success',
        title: 'Paramètres enregistrés',
        message: 'Le numéro WhatsApp et les paramètres ont été mis à jour.',
      });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Settings update error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de synchroniser les paramètres.',
      });
    } finally {
      setSaving(false);
    }
  };

  const testWhatsAppUrl = buildWhatsAppUrl('Bonjour PENTA GAD Distribution, test de configuration WhatsApp.');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
              Configuration Centrale
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Paramètres Entreprise & Numéro WhatsApp
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Modifiez ici le numéro WhatsApp officiel recevant les commandes ainsi que les coordonnées d'entreprise. Les changements se répercutent automatiquement sur l'ensemble de la plateforme.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={testWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tester lien ({settings.whatsappNumber})</span>
          </a>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration sauvegardée et synchronisée avec Firebase !</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* WhatsApp & Contacts Card */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Numéro WhatsApp Commercial</span>
          </div>

          <Input
            label="Numéro WhatsApp Officiel (format international) *"
            required
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            placeholder="+2250703397021"
            helperText={`Nettoyé pour wa.me : ${cleanWhatsAppNumber}`}
          />

          <Input
            label="Numéro de Téléphone affiché dans l'en-tête *"
            required
            value={form.phoneDisplay}
            onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })}
            placeholder="+225 07 03 39 70 21"
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Email Officiel *"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="pentagad.distribution@gmail.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        {/* Coordonnées & Livraison */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            <span>Localisation & Horaires</span>
          </div>

          <Input
            label="Raison Sociale / Enseigne"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="PENTA GAD Distribution"
          />

          <Input
            label="Adresse Showroom & Entrepôt Central"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Abidjan, Côte d'Ivoire - Showroom & Entrepôt Central"
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Horaires d'ouverture"
            value={form.openingHours}
            onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
            placeholder="Lun - Sam : 08h00 - 18h30"
            leftIcon={<Clock className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Input
              label="Frais livraison standard (FCFA)"
              type="number"
              value={form.standardDeliveryFee}
              onChange={(e) => setForm({ ...form, standardDeliveryFee: Number(e.target.value) })}
            />

            <Input
              label="Seuil livraison offerte (FCFA)"
              type="number"
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-2 flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4 text-[#C5A059]" />}
          >
            Enregistrer la configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
