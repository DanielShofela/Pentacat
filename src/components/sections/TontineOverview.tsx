import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  UserCheck,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { tontineService } from '../../services/tontineService';
import { TontineGroup } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { TontineDashboardView } from '../tontine/TontineDashboardView';

export const TontineOverview: React.FC = () => {
  const { user, customer, isAdmin } = useAuth();
  const { setIsAuthModalOpen } = useAppNavigation();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'groups'>('dashboard');
  const [groups, setGroups] = useState<TontineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 pb-24">
      
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium backdrop-blur-xs border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>Tontine Rotative PENTA GAD</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            L'épargne collective intelligente pour équiper votre maison à 0% d'intérêt.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
            Groupes de 10 personnes avec rotation périodique de 10 jours et cycle global configurable de 110 jours. Chaque membre reçoit à son tour son équipement neuf, certifié et garanti par PENTA GAD Distribution.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200/80 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'dashboard'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#C5A059]" />
          <span>Tableau de Bord Rotations & 10 Positions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('groups')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'groups'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>Groupes en cours d'ouverture ({groups.length})</span>
        </button>
      </div>

      {/* Tab 1: Dashboard with live 10 positions & rotations */}
      {activeSubTab === 'dashboard' && (
        <TontineDashboardView isAdmin={isAdmin} />
      )}

      {/* Tab 2: Groups */}
      {activeSubTab === 'groups' && (
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9A7426]">Groupes ouverts</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Rejoindre un groupe de tontine PENTA GAD
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              10 positions par groupe · Rotation de 10 jours · Cycle global de 110 jours
            </p>
          </div>

          {loading ? (
            <LoadingState count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {groups.map((group) => {
                const totalPos = group.memberCount || group.totalPositions || 10;
                const filled = group.filledPositions || 0;
                const spotsLeft = Math.max(0, totalPos - filled);
                const progressPercent = Math.round((filled / totalPos) * 100);

                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                        <img
                          src={
                            group.targetProductImage ||
                            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 bg-slate-950/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {group.groupCode || group.code}
                        </span>
                      </div>

                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 tracking-tight leading-snug">
                            {group.name || group.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {group.description || 'Groupe rotatif pour équipement de maison.'}
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Rotation :</span>
                          <span className="font-bold text-slate-900">
                            {group.rotationPeriodDays} jours / membre ({group.totalDurationDays}j total)
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500">Membres :</span>
                            <span className="font-bold text-slate-900">
                              {filled}/{totalPos} places ({spotsLeft} disponible{spotsLeft > 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-slate-950 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Début : {formatDate(group.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Choix de produit distinct par membre</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Button
                        variant={spotsLeft > 0 ? 'primary' : 'outline'}
                        fullWidth
                        size="md"
                        disabled={spotsLeft <= 0}
                        onClick={() => {
                          setActiveSubTab('dashboard');
                        }}
                        leftIcon={<Users className="w-3.5 h-3.5 text-[#C5A059]" />}
                      >
                        {spotsLeft > 0 ? 'Voir la rotation du groupe' : 'Groupe complet'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
