import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  FileText, 
  Play, 
  ShieldCheck,
  Package,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  TontineGroup, 
  TontineMember, 
  TontineRotation, 
  TontineContribution 
} from '../../types';
import { tontineService } from '../../services/tontineService';
import { tontineTestScenario } from '../../services/tontineTestScenario';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { TontineRotationTimeline } from './TontineRotationTimeline';
import { TontineContributionModal } from './TontineContributionModal';
import { TontineAddMemberModal } from './TontineAddMemberModal';
import { TontineCreateGroupModal } from './TontineCreateGroupModal';
import { TontineDeliveryModal } from './TontineDeliveryModal';
import { useToast } from '../../context/ToastContext';

interface TontineDashboardViewProps {
  isAdmin?: boolean;
}

export const TontineDashboardView: React.FC<TontineDashboardViewProps> = ({
  isAdmin = false,
}) => {
  const { showToast } = useToast();

  const [groups, setGroups] = useState<TontineGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<TontineMember[]>([]);
  const [rotations, setRotations] = useState<TontineRotation[]>([]);
  const [contributions, setContributions] = useState<TontineContribution[]>([]);
  
  const [currentBeneficiary, setCurrentBeneficiary] = useState<TontineMember | null>(null);
  const [nextBeneficiary, setNextBeneficiary] = useState<TontineMember | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(1);

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<TontineMember | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedMemberForDelivery, setSelectedMemberForDelivery] = useState<TontineMember | null>(null);

  const [runningScenario, setRunningScenario] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await tontineService.getTontineGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    } catch (err) {
      console.warn('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    if (!groupId) return;
    try {
      const [overview, contribs] = await Promise.all([
        tontineService.getRotationOverview(groupId),
        tontineService.getGroupContributions(groupId),
      ]);
      setMembers(overview.allMembers);
      setRotations(overview.rotations);
      setCurrentPosition(overview.currentPosition);
      setCurrentBeneficiary(overview.currentBeneficiary);
      setNextBeneficiary(overview.nextBeneficiary);
      setContributions(contribs);
    } catch (err) {
      console.warn('Error loading group details:', err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetails(selectedGroupId);
    }
  }, [selectedGroupId]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const handleRunTenMembersTest = async () => {
    setRunningScenario(true);
    try {
      const groupCode = await tontineTestScenario.runTenMembersScenario();
      showToast({
        type: 'success',
        title: 'Scénario 10 membres généré avec succès',
        message: `Groupe créé : ${groupCode} avec 10 membres, rotations, cotisations et livraisons.`,
      });
      await loadGroups();
      const updatedGroups = await tontineService.getTontineGroups();
      const created = updatedGroups.find((g) => g.groupCode === groupCode);
      if (created) setSelectedGroupId(created.id);
    } catch (err: any) {
      console.error('Error running test scenario:', err);
      showToast({
        type: 'error',
        title: 'Erreur de scénario',
        message: err.message || 'Impossible d’exécuter le scénario.',
      });
    } finally {
      setRunningScenario(false);
    }
  };

  const handleAdvanceRotation = async () => {
    if (!selectedGroup) return;
    const nextPos = (selectedGroup.currentRotationPosition || 1) + 1;
    if (nextPos > selectedGroup.memberCount) {
      alert('Toutes les positions ont été achevées.');
      return;
    }
    try {
      await tontineService.setGroupRotationPosition(selectedGroup.id, nextPos);
      showToast({
        type: 'success',
        title: 'Rotation avancée',
        message: `Passage à la position #${nextPos} dans ${selectedGroup.groupCode}.`,
      });
      await loadGroups();
      loadGroupDetails(selectedGroup.id);
    } catch (err) {
      console.error('Error advancing rotation:', err);
    }
  };

  // Group metrics
  const totalTargetExpected = members.reduce((sum, m) => sum + m.expectedContribution, 0);
  const totalContributed = members.reduce((sum, m) => sum + m.totalContributed, 0);
  const globalProgress = totalTargetExpected > 0 ? Math.min(100, Math.round((totalContributed / totalTargetExpected) * 100)) : 0;

  const upToDateMembers = members.filter((m) => m.totalContributed >= m.expectedContribution * (m.position / (selectedGroup?.memberCount || 10)));
  const overdueMembers = members.filter((m) => !upToDateMembers.includes(m));

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Group Selection & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
              Groupe Tontine :
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupCode} - {g.name} ({g.filledPositions || members.length}/{g.memberCount} membres)
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadGroups();
                if (selectedGroupId) loadGroupDetails(selectedGroupId);
              }}
              isLoading={loading}
              title="Actualiser"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateGroupOpen(true)}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-slate-700" />}
              >
                Créer un groupe
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMemberOpen(true)}
                leftIcon={<Users className="w-3.5 h-3.5 text-slate-700" />}
              >
                Ajouter un membre
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRunTenMembersTest}
                isLoading={runningScenario}
                leftIcon={<Play className="w-3.5 h-3.5 text-[#C5A059]" />}
              >
                Tester scénario 10 membres
              </Button>
            </>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title="Aucun groupe tontine actif"
          description="Créez votre premier groupe de 10 personnes ou lancez le scénario de test automatique."
          actionLabel="Créer un groupe ou Lancer le test"
          onAction={handleRunTenMembersTest}
        />
      ) : selectedGroup && (
        <div className="space-y-6">
          
          {/* Main Group Header Card */}
          <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#C5A059] text-slate-950 uppercase">
                    {selectedGroup.groupCode}
                  </span>
                  <Badge variant={selectedGroup.status === 'active' ? 'green' : 'slate'} size="sm" dot>
                    {selectedGroup.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Cycle de {selectedGroup.totalDurationDays} jours · Période : {selectedGroup.rotationPeriodDays} jours
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{selectedGroup.description}</p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdvanceRotation}
                    className="border-white/20 text-white hover:bg-white/10"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5 text-[#C5A059]" />}
                  >
                    Passer au tour suivant (#{currentPosition + 1})
                  </Button>
                </div>
              )}
            </div>

            {/* Group Financial & Duration Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Membres inscrits</span>
                <span className="font-black text-sm sm:text-base text-white block mt-0.5">
                  {members.length} / {selectedGroup.memberCount} personnes
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Calendrier global</span>
                <span className="font-bold text-xs sm:text-sm text-slate-200 block mt-0.5">
                  {formatDate(selectedGroup.startDate)} → {formatDate(selectedGroup.endDate)}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Total Cotisé au groupe</span>
                <span className="font-black text-sm sm:text-base text-[#C5A059] block mt-0.5">
                  {formatFCFA(totalContributed)}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Progression du cycle</span>
                <span className="font-black text-sm sm:text-base text-emerald-400 block mt-0.5">
                  {globalProgress}% complété
                </span>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[#C5A059] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, globalProgress)}%` }}
              />
            </div>
          </div>

          {/* Highlights Grid: Bénéficiaire Actuel & Prochain Bénéficiaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Bénéficiaire Actuel */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-3xl border border-[#C5A059]/40 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 text-[#C5A059] flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#9A7426]">
                    Bénéficiaire Actuel (Tour #{currentPosition})
                  </span>
                </div>
                <Badge variant="gold" size="sm" dot>Cycle Actif</Badge>
              </div>

              {currentBeneficiary ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">
                        {currentBeneficiary.customerName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {currentBeneficiary.customerPhone} · {currentBeneficiary.deliveryCommune || 'Abidjan'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Position</span>
                      <span className="font-mono font-black text-base text-slate-900">
                        #{currentBeneficiary.position} / {selectedGroup.memberCount}
                      </span>
                    </div>
                  </div>

                  {/* Product card */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {currentBeneficiary.productSnapshot.imageUrl ? (
                        <img 
                          src={currentBeneficiary.productSnapshot.imageUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block">{currentBeneficiary.productSnapshot.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {currentBeneficiary.productSnapshot.brand} · Réf: {currentBeneficiary.productSnapshot.reference}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-950">
                      {formatFCFA(currentBeneficiary.expectedContribution)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>
                        Livraison : <strong>{currentBeneficiary.deliveryStatus || 'pending'}</strong>
                      </span>
                    </div>

                    {isAdmin && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedMemberForDelivery(currentBeneficiary);
                          setIsDeliveryModalOpen(true);
                        }}
                      >
                        Gérer la livraison
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/80 rounded-xl text-center text-xs text-slate-400">
                  Aucun membre assigné au Tour #{currentPosition}.
                </div>
              )}
            </div>

            {/* 2. Prochain Bénéficiaire */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-500/5 via-blue-50/30 to-white rounded-3xl border border-blue-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                    Prochain Bénéficiaire (Tour #{currentPosition + 1})
                  </span>
                </div>
                <Badge variant="blue" size="sm">Prochaine Échéance</Badge>
              </div>

              {nextBeneficiary ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-slate-950 tracking-tight">
                        {nextBeneficiary.customerName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {nextBeneficiary.customerPhone} · {nextBeneficiary.deliveryCommune || 'Abidjan'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Position</span>
                      <span className="font-mono font-black text-base text-slate-900">
                        #{nextBeneficiary.position} / {selectedGroup.memberCount}
                      </span>
                    </div>
                  </div>

                  {/* Product card */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {nextBeneficiary.productSnapshot.imageUrl ? (
                        <img 
                          src={nextBeneficiary.productSnapshot.imageUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100" 
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block">{nextBeneficiary.productSnapshot.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {nextBeneficiary.productSnapshot.brand} · Réf: {nextBeneficiary.productSnapshot.reference}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-950">
                      {formatFCFA(nextBeneficiary.expectedContribution)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Avancement : <strong>{formatFCFA(nextBeneficiary.totalContributed)}</strong> réglé
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMemberForPayment(nextBeneficiary);
                        setIsContributionModalOpen(true);
                      }}
                      leftIcon={<CreditCard className="w-3.5 h-3.5 text-slate-700" />}
                    >
                      Enregistrer versement
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/80 rounded-xl text-center text-xs text-slate-400">
                  {currentPosition >= selectedGroup.memberCount
                    ? 'Fin du cycle de rotation atteint.'
                    : `Position #${currentPosition + 1} en attente d'inscription.`}
                </div>
              )}
            </div>

          </div>

          {/* Members Status Strip: À jour vs Retards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Cotisations enregistrées</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{contributions.length} paiements</span>
              </div>
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-emerald-700 block font-medium">Membres à jour</span>
                <span className="text-lg font-black text-emerald-800 mt-0.5 block">{upToDateMembers.length} personnes</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-amber-800 block font-medium">Membres en retard</span>
                <span className="text-lg font-black text-amber-900 mt-0.5 block">{overdueMembers.length} personnes</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* 10-Positions Interactive Rotation Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
            <TontineRotationTimeline
              group={selectedGroup}
              members={members}
              rotations={rotations}
              currentPosition={currentPosition}
              onRecordPayment={(mem) => {
                setSelectedMemberForPayment(mem);
                setIsContributionModalOpen(true);
              }}
              onUpdateDelivery={(mem) => {
                setSelectedMemberForDelivery(mem);
                setIsDeliveryModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          </div>

          {/* Recent Contributions Journal */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C5A059]" />
                <span>Journal des Cotisations & Tracabilité ({contributions.length})</span>
              </h3>
            </div>

            {contributions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Aucune cotisation enregistrée pour l'instant.
              </p>
            ) : (
              <div className="space-y-2">
                {contributions.slice(0, 8).map((c) => {
                  const mem = members.find((m) => m.id === c.memberId);
                  return (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{formatFCFA(c.amount)}</span>
                          <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 rounded text-slate-600">
                            {c.reference}
                          </span>
                          <Badge variant="green" size="sm">Validé</Badge>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Type : {c.paymentType || 'Journalier'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Membre : <strong>{mem?.customerName || 'Inconnu'} (Tour #{mem?.position})</strong> · Canal : {c.method.toUpperCase()} · {formatDate(c.date || c.createdAt)}
                        </p>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-700">✓ Enregistré</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modals */}
      {isCreateGroupOpen && (
        <TontineCreateGroupModal
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          onSuccess={() => {
            loadGroups();
          }}
        />
      )}

      {isAddMemberOpen && selectedGroup && (
        <TontineAddMemberModal
          group={selectedGroup}
          existingMembers={members}
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={() => {
            loadGroupDetails(selectedGroup.id);
            loadGroups();
          }}
        />
      )}

      {isContributionModalOpen && selectedMemberForPayment && (
        <TontineContributionModal
          member={selectedMemberForPayment}
          groupCode={selectedGroup?.groupCode}
          isOpen={isContributionModalOpen}
          onClose={() => setIsContributionModalOpen(false)}
          onSuccess={() => {
            if (selectedGroupId) loadGroupDetails(selectedGroupId);
          }}
          isAdmin={isAdmin}
        />
      )}

      {isDeliveryModalOpen && selectedMemberForDelivery && (
        <TontineDeliveryModal
          member={selectedMemberForDelivery}
          isOpen={isDeliveryModalOpen}
          onClose={() => setIsDeliveryModalOpen(false)}
          onSuccess={() => {
            if (selectedGroupId) loadGroupDetails(selectedGroupId);
          }}
        />
      )}

    </div>
  );
};
