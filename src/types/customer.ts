export interface Customer {
  id: string; // Document ID (usually matches auth UID)
  uid: string;
  nom: string;
  fullName: string; // Alias for compatibility
  téléphone: string;
  phone: string; // Alias for compatibility
  whatsapp: string;
  whatsappNumber?: string; // Alias for compatibility
  commune: string;
  adresse: string;
  address?: string; // Alias for compatibility
  city?: string;
  idCardNumber?: string; // CNI / Passeport pour contrats échelonnés
  idCardPhotoUrl?: string;
  statut: 'active' | 'pending' | 'suspended';
  status?: 'active' | 'pending' | 'suspended'; // Alias
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  email?: string;
}
