export type AdminRole = 'super_admin' | 'manager' | 'operator' | 'accountant';

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string; // Ex: 'order_status_updated', 'installment_approved', 'tontine_cycle_closed'
  entityType: 'order' | 'product' | 'category' | 'installment' | 'tontine' | 'customer' | 'delivery';
  entityId: string;
  details?: string;
  timestamp: string;
}
