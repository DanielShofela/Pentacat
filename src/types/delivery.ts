export type DeliverySourceType = 'classic_order' | 'installment_contract' | 'tontine_rotation';
export type DeliveryStatus = 'assigned' | 'in_preparation' | 'out_for_delivery' | 'delivered' | 'failed' | 'rescheduled';

export interface Delivery {
  id: string;
  trackingNumber: string; // Ex: LIV-2026-0089
  sourceType: DeliverySourceType;
  sourceId: string; // orderId, contractId, or rotationId
  customerId: string;
  recipientName: string;
  recipientPhone: string;
  city: string; // Abidjan, etc.
  commune?: string;
  address: string;
  deliveryFee?: number;
  driverName?: string;
  driverPhone?: string;
  status: DeliveryStatus;
  estimatedDate?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
