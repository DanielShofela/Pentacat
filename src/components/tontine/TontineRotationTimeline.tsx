import React from 'react';
import { 
  Users, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard, 
  Package, 
  AlertTriangle,
  Calendar,
  PlusCircle
} from 'lucide-react';
import { TontineGroup, TontineMember, TontineRotation } from '../../types';
import { formatFCFA, formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TontineRotationTimelineProps {
  group: TontineGroup;
  members: TontineMember[];
  rotations: TontineRotation[];
  currentPosition: number;
  onRecordPayment: (member: TontineMember) => void;
  onUpdateDelivery: (member: TontineMember) => void;
  isAdmin?: boolean;
}

export const TontineRotationTimeline: React.FC<TontineRotationTimelineProps> = ({
  group,
  members,
  rotations,
  currentPosition,
  onRecordPayment,
  onUpdateDelivery,
  isAdmin = false,
}) => {
  const memberMap = new Map<number, TontineMember>();
  members.forEach(m => memberMap.set(m.position, m));

  const rotationMap = new Map<number, TontineRotation>();
  rotations.forEach(r => rotationMap.set(r.position, r));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C5A059]" />
            <span>Tableau des {group.memberCount} Positions de Rotation</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ordre chronologique des bénéficiaires · Périodes de {group.rotationPeriodDays} jours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: group.memberCount }, (_, idx) => idx + 1).map((pos) => {
          const member = memberMap.get(pos);
          const rotation = rotationMap.get(pos);
          
          const isCurrent = pos === currentPosition;
          const isNext = pos === currentPosition + 1;
          const isPast = pos < currentPosition;
          const isUpcoming = pos > currentPosition + 1;

          const progressPercent = member 
            ? Math.min(100, Math.round((member.totalContributed / member.expectedContribution) * 100))
            : 0;

          return (
            <div
              key={pos}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-amber-50/50 border-[#C5A059] shadow-sm ring-1 ring-[#C5A059]'
                  : isNext
                  ? 'bg-blue-50/40 border-blue-200'
                  : isPast
                  ? 'bg-slate-50 border-slate-200/80 opacity-90'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                
                {/* Position Number & Status */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-2xs ${
                      isCurrent
                        ? 'bg-slate-950 text-[#C5A059]'
                        : isNext
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{pos}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {member ? member.customerName : <span className="text-slate-400 italic">Position libre</span>}
                      </h4>

                      {isCurrent && (
                        <Badge variant="gold" size="sm" dot>Bénéficiaire Actuel</Badge>
                      )}
                      {isNext && (
                        <Badge variant="blue" size="sm" dot>Prochain Bénéficiaire</Badge>
                      )}
                      {isPast && (
                        <Badge variant="green" size="sm">Tour Passé</Badge>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {rotation ? (
                        <span>Période : {formatDate(rotation.startDate)} → {formatDate(rotation.endDate)}</span>
                      ) : (
                        <span>Échéance Tour #{pos}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button */}
                {member && (
                  <div className="shrink-0 flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecordPayment(member)}
                      leftIcon={<CreditCard className="w-3 h-3 text-slate-600" />}
                    >
                      Cotiser
                    </Button>
                  </div>
                )}
              </div>

              {/* Product and Financial details if member exists */}
              {member && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {member.productSnapshot.imageUrl ? (
                        <img 
                          src={member.productSnapshot.imageUrl} 
                          alt={member.productSnapshot.name}
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0" 
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <span className="font-bold text-[11px] text-slate-800 truncate block">
                          {member.productSnapshot.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {member.productSnapshot.brand} · Réf: {member.productSnapshot.reference}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-slate-900 block">
                        {formatFCFA(member.expectedContribution)}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-semibold block">
                        Versé : {formatFCFA(member.totalContributed)}
                      </span>
                    </div>
                  </div>

                  {/* Member Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Cotisation : {progressPercent}%</span>
                      <span>Reste : {formatFCFA(member.remainingAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPercent >= 100
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-[#C5A059]'
                            : 'bg-slate-900'
                        }`}
                        style={{ width: `${Math.max(3, progressPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delivery Status Strip */}
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>
                        Livraison :{' '}
                        <strong className={
                          member.deliveryStatus === 'delivered'
                            ? 'text-emerald-700'
                            : member.deliveryStatus === 'pending'
                            ? 'text-amber-800'
                            : 'text-slate-500'
                        }>
                          {member.deliveryStatus === 'delivered' ? 'Livré ✓' :
                           member.deliveryStatus === 'shipped' ? 'En acheminement' :
                           member.deliveryStatus === 'pending' ? 'En attente d’expédition' :
                           member.deliveryStatus === 'scheduled' ? 'Programmée' :
                           'À la fin de la rotation'}
                        </strong>
                      </span>
                    </div>

                    {isAdmin && (isCurrent || isPast) && (
                      <button
                        type="button"
                        onClick={() => onUpdateDelivery(member)}
                        className="text-[10px] font-bold text-slate-700 hover:text-slate-950 underline"
                      >
                        Gérer livraison
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
