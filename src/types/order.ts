export type OrderStatus = 'pending' | 'whatsapp_sent' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'refunded';
export type PaymentMethod = 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'cash_on_delivery' | 'bank_transfer';

export interface OrderItem {
  productId: string;
  productReference?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Ex: PG-202610-001
  customerId?: string; // Optional for non-logged-in customers
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryCommune?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  source: 'web' | 'whatsapp' | 'in_store';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
