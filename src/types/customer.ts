export interface Customer {
  id: string; // Document ID (usually matches auth UID)
  uid: string;
  fullName: string;
  email?: string;
  phone: string;
  whatsappNumber?: string;
  city: string; // ex: Abidjan, Bouaké, San-Pédro, Yamoussoukro
  commune?: string; // ex: Cocody, Yopougon, Marcory, Plateau
  address?: string;
  idCardNumber?: string; // CNI / Passeport pour contrats échelonnés et tontines
  idCardPhotoUrl?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}
