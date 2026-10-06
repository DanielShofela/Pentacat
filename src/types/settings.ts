export interface CompanySettings {
  name: string;
  whatsappNumber: string; // Ex: '+2250703397021'
  phoneDisplay: string; // Ex: '+225 07 03 39 70 21'
  email: string;
  address: string;
  openingHours: string;
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  updatedAt?: string;
}
