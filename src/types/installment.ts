export type InstallmentContractStatus = 
  | 'pending' 
  | 'active' 
  | 'completed' 
  | 'cancelled' 
  | 'overdue';

export type InstallmentPaymentStatus = 'pending' | 'approved' | 'rejected';

export type InstallmentDeliveryStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'shipped' 
  | 'delivered';

export interface ProductSnapshot {
  id: string;
  reference: string;
  name: string;
  brand: string;
  categoryName?: string;
  imageUrl?: string;
  cashPrice: number;
}

export interface InstallmentContract {
  id: string;
  contractNumber?: string; // Ex: CTR-2026-0042
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  progressPercentage: number;
  duration: number; // e.g. 3, 6, 8 months
  frequency: 'monthly' | 'biweekly';
  startDate: string;
  expectedEndDate: string;
  monthlyPayment: number;
  nextPaymentDueDate?: string;
  status: InstallmentContractStatus;
  deliveryStatus?: InstallmentDeliveryStatus;
  deliveryAddress?: string;
  deliveryCommune?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility aliases
  productName?: string;
  productPrice?: number;
  remainingBalance?: number;
  durationMonths?: number;
}

export interface InstallmentPayment {
  id: string;
  contractId: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'bank_transfer' | 'cash';
  reference: string; // Ex: transaction ID Wave/MoMo or official receipt #
  status: InstallmentPaymentStatus;
  recordedBy: string; // 'system' | 'client' | operator email
  notes?: string;
  createdAt: string;
}
