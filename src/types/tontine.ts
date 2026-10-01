export type TontineGroupStatus = 'open' | 'active' | 'completed' | 'cancelled';
export type TontineFrequency = 'weekly' | 'bi-weekly' | 'monthly';
export type TontineMemberStatus = 'pending' | 'active' | 'completed' | 'defaulted';
export type TontineContributionStatus = 'pending' | 'validated' | 'late';

export interface TontineGroup {
  id: string;
  code: string; // Ex: TNT-FRIG-01
  title: string;
  description?: string;
  targetProductId: string;
  targetProductName: string;
  targetProductPrice: number;
  targetProductImage?: string;
  
  frequency: TontineFrequency;
  totalPositions: number; // Ex: 5 ou 10 membres
  filledPositions: number;
  contributionAmount: number; // Montant par cotisation (FCFA)
  totalTargetAmount: number; // Montant total du lot
  
  durationCycles: number;
  currentCycle: number;
  status: TontineGroupStatus;
  
  startDate?: string;
  estimatedEndDate?: string;
  rulesDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TontineMember {
  id: string;
  groupId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  assignedPosition: number; // Numéro d'ordre de tirage / de rotation (ex: tour 1, tour 2...)
  joinedAt: string;
  hasReceivedDelivery: boolean;
  deliveryDate?: string;
  status: TontineMemberStatus;
}

export interface TontineContribution {
  id: string;
  groupId: string;
  memberId: string;
  customerId: string;
  cycleNumber: number;
  amount: number;
  paymentMethod: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'cash';
  reference?: string;
  status: TontineContributionStatus;
  paidAt: string;
  verifiedAt?: string;
}

export interface TontineRotation {
  id: string;
  groupId: string;
  cycleNumber: number;
  beneficiaryMemberId: string;
  beneficiaryCustomerId: string;
  beneficiaryName: string;
  scheduledDate: string;
  deliveryStatus: 'pending' | 'in_transit' | 'delivered';
  status: 'upcoming' | 'current' | 'completed';
}
