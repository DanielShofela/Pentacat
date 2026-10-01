export type ContractStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'active' 
  | 'fully_paid' 
  | 'defaulted' 
  | 'cancelled';

export type InstallmentDeliveryStatus = 
  | 'pending_deposit' 
  | 'approved_for_delivery' 
  | 'delivered' 
  | 'returned';

export type InstallmentPaymentStatus = 'pending' | 'verified' | 'rejected';

export interface InstallmentContract {
  id: string;
  contractNumber: string; // Ex: CTR-2026-0042
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  productName: string;
  productPrice: number;
  totalAmount: number; // Prix total avec éventuels frais de dossier
  depositAmount: number; // Acompte initial versé
  remainingBalance: number; // Solde restant
  durationMonths: number; // Ex: 3, 6, 9 mois
  monthlyPayment: number; // Montant de chaque mensualité
  paidInstallmentsCount: number;
  totalInstallmentsCount: number;
  status: ContractStatus;
  deliveryStatus: InstallmentDeliveryStatus;
  startDate: string;
  nextPaymentDueDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InstallmentPayment {
  id: string;
  contractId: string;
  customerId: string;
  installmentIndex: number; // 0 = acompte, 1 = 1ere mensualité, etc.
  amount: number;
  paymentMethod: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'bank_transfer' | 'cash';
  reference?: string; // Référence de transaction Mobile Money ou reçu
  receiptUrl?: string;
  status: InstallmentPaymentStatus;
  verifiedBy?: string;
  paidAt: string;
  createdAt: string;
}
