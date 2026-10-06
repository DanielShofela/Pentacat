export type TontineGroupStatus = 
  | 'draft' 
  | 'open' 
  | 'full' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type TontineMemberStatus = 
  | 'active' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled';

export type TontineRotationStatus = 
  | 'upcoming' 
  | 'current' 
  | 'completed';

export type TontineContributionStatus = 
  | 'approved' 
  | 'pending' 
  | 'rejected';

export type TontineDeliveryStatus = 
  | 'not_eligible' 
  | 'pending' 
  | 'scheduled' 
  | 'shipped' 
  | 'delivered';

export type TontineContributionFrequency = 
  | 'daily' 
  | 'per_period' 
  | 'monthly';

export type TontineContributionType = 
  | 'daily' 
  | 'grouped' 
  | 'partial' 
  | 'regularization' 
  | 'late';

export interface TontineMemberProductSnapshot {
  id: string;
  reference: string;
  name: string;
  brand: string;
  cashPrice: number;
  imageUrl?: string;
}

export interface TontineGroup {
  id: string;
  groupCode: string; // Ex: TG-001, TG-002, TG-003
  name: string;
  description?: string;
  
  // Product configuration (support both single product or custom per-member product)
  productId?: string;
  targetProductId?: string;
  targetProductName?: string;
  targetProductPrice?: number;
  targetProductImage?: string;
  allowCustomProducts?: boolean;

  // Configurable parameters (NEVER hardcoded)
  memberCount: number; // default 10
  rotationPeriodDays: number; // default 10
  totalDurationDays: number; // default 110
  contributionFrequency: TontineContributionFrequency; // default 'daily' or 'per_period'

  startDate: string;
  endDate: string;
  status: TontineGroupStatus;
  currentRotationPosition?: number; // 1..memberCount

  createdAt: string;
  updatedAt: string;

  // Backward compatibility aliases
  code?: string;
  title?: string;
  totalPositions?: number;
  filledPositions?: number;
  contributionAmount?: number;
  totalTargetAmount?: number;
  durationCycles?: number;
  currentCycle?: number;
  frequency?: string;
  rulesDescription?: string;
}

export interface TontineMember {
  id: string;
  groupId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  
  position: number; // Unique 1..memberCount
  productId: string;
  productSnapshot: TontineMemberProductSnapshot;
  
  expectedContribution: number; // Total expected or per-cycle
  dailyAmount?: number;
  totalContributed: number;
  remainingAmount: number;
  
  status: TontineMemberStatus;
  beneficiaryDate: string; // Calculated expected date
  deliveryStatus: TontineDeliveryStatus;
  deliveryAddress?: string;
  deliveryCommune?: string;
  
  joinedAt: string;
  updatedAt?: string;

  // Backward compatibility aliases
  assignedPosition?: number;
  hasReceivedDelivery?: boolean;
}

export interface TontineRotation {
  id: string;
  groupId: string;
  position: number;
  memberId: string;
  memberName: string;
  customerId?: string;
  productId?: string;
  productName?: string;
  startDate: string;
  endDate: string;
  status: TontineRotationStatus;
  deliveryStatus?: TontineDeliveryStatus;
}

export interface TontineContribution {
  id: string;
  groupId: string;
  memberId: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'cash' | 'bank_transfer';
  reference: string;
  status: TontineContributionStatus;
  recordedBy: string; // 'client' | admin email / operator
  paymentType: TontineContributionType;
  notes?: string;
  createdAt: string;

  // Backward compatibility aliases
  cycleNumber?: number;
  paymentMethod?: string;
  paidAt?: string;
}
