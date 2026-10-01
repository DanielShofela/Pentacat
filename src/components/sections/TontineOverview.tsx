import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { tontineService } from '../../services/tontineService';
import { TontineGroup } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { formatFCFA, formatDate } from '../../utils/formatters';

export const TontineOverview: React.FC = () => {
  const { user, customer } = useAuth();
  const { setIsAuthModalOpen } = useAppNavigation();

  const [groups, setGroups] = useState<TontineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<TontineGroup | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      setLoading(true);
      try {
        const data = await tontineService.getTontineGroups();
        setGroups(data);
      } catch (err) {
        console.error('Error fetching tontine groups:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  const handleJoin = async (group: TontineGroup) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setJoining(true);
    try {
      await tontineService.joinTontineGroup({
        groupId: group.id,
        customerId: user.uid,
        customerName: customer?.fullName || user.displayName || 'Membre PENTA',
        customerPhone: customer?.phone || '0700000000',
      });
      setJoinSuccess(group.title);
      setSelectedGroup(null);
    } catch (err) {
      console.error('Join error:', err);
      alert('Une erreur est survenue lors de l\'adhésion.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Tontine Rotative d'Équipement PENTA GAD</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            L'épargne collective intelligente pour équiper votre foyer à 0% d'intérêt.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Une formule ivoirienne modernisée et sécurisée : chaque membre cotise un montant fixe mensuel. À chaque cycle, un participant reçoit son équipement neuf, livré et garanti par PENTA GAD.
          </p>
        </div>
      </div>

      {/* 3 Strong Advantages of Tontine PENTA GAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            0%
          </div>
          <h4 className="font-bold text-sm text-slate-900">Zéro intérêt bancaire</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Le total de vos cotisations correspond exactement à la valeur réelle de l'équipement, sans aucun frais d'usure ni intérêt caché.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Supervision & Garantie Entreprise</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Contrairement aux tontines informelles, PENTA GAD garantit la livraison même en cas de défaillance d'un membre.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Tirage & Calendrier Transparent</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ordre des tours fixé dès le départ dans l'Espace Client, alertes de paiement SMS/WhatsApp et suivi des livraisons.
          </p>
        </div>
      </div>

      {/* Join Confirmation Banner if just joined */}
      {joinSuccess && (
        <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-purple-700 shrink-0" />
            <div>
              <h4 className="font-bold text-purple-900 text-sm">Adhésion confirmée au groupe "{joinSuccess}" !</h4>
              <p className="text-xs text-purple-700">Votre position sera validée dans votre Espace Client dès le lancement du cycle.</p>
            </div>
          </div>
          <button
            onClick={() => setJoinSuccess(null)}
            className="text-xs font-semibold text-purple-900 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Open Tontine Groups List */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Groupes de Tontine Actuellement Ouverts</h2>
          <p className="text-xs text-slate-500 mt-0.5">Places limitées par groupe • Démarrage dès remplissage complet</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.map(group => {
              const progressPercent = Math.round((group.filledPositions / group.totalPositions) * 100);
              const spotsLeft = group.totalPositions - group.filledPositions;

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & status */}
                    <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                      <img
                        src={group.targetProductImage || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
                        alt={group.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-purple-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {group.code}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">{group.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{group.description}</p>
                      </div>

                      {/* Contribution Metric */}
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                        <span className="text-xs text-purple-900 font-medium">Cotisation mensuelle :</span>
                        <span className="font-black text-purple-800 text-sm">
                          {formatFCFA(group.contributionAmount)} / mois
                        </span>
                      </div>

                      {/* Progress / Spots remaining */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Places occupées :</span>
                          <span className="font-bold text-slate-900">
                            {group.filledPositions} sur {group.totalPositions} ({spotsLeft} restante{spotsLeft > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>Début estimé : {formatDate(group.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{group.durationCycles} mensualités pour {group.totalPositions} bénéficiaires</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleJoin(group)}
                      disabled={joining || spotsLeft <= 0}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{spotsLeft > 0 ? 'Rejoindre ce groupe de tontine' : 'Groupe complet'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
