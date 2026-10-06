/**
 * Utility functions for PENTA GAD Distribution
 * Tailored for Ivory Coast (FCFA, Abidjan phone format, WhatsApp)
 */

export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatIvorianPhone(phone: string): string {
  // Cleans and formats Ivorian 10-digit telephone numbers (ex: 07 00 00 00 00)
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

export function sanitizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If local 10 digits starting with 0, add 225
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '225' + cleaned;
  } else if (!cleaned.startsWith('225') && cleaned.length === 8) {
    cleaned = '225' + cleaned;
  }
  return cleaned;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

import { companySettingsService } from '../services/companySettingsService';

export const PENTA_GAD_CONTACTS = {
  get name() {
    return companySettingsService.getSettings().name;
  },
  get whatsapp() {
    return companySettingsService.getSettings().whatsappNumber;
  },
  get phoneDisplay() {
    return companySettingsService.getSettings().phoneDisplay;
  },
  get email() {
    return companySettingsService.getSettings().email;
  },
  get address() {
    return companySettingsService.getSettings().address;
  },
  get openingHours() {
    return companySettingsService.getSettings().openingHours;
  },
};

export function generateWhatsAppOrderMessage(params: {
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryCity?: string;
  deliveryCommune: string;
  deliveryAddress: string;
  notes?: string;
  items: Array<{
    productName: string;
    productReference?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
  }>;
  totalAmount: number;
  deliveryFee?: number;
  paymentMethod?: string;
}): string {
  let msg = `Bonjour PENTA GAD Distribution,\n\nJe souhaite commander :\n\n`;

  params.items.forEach((item, index) => {
    msg += `Produit : ${item.productName}\n`;
    if (item.productReference) {
      msg += `Référence : ${item.productReference}\n`;
    }
    msg += `Quantité : ${item.quantity}\n`;
    const itemPrice = item.totalPrice || item.unitPrice * item.quantity;
    msg += `Prix : ${formatFCFA(itemPrice)}\n\n`;
  });

  const grandTotal = params.totalAmount + (params.deliveryFee || 0);
  msg += `Total : ${formatFCFA(grandTotal)}\n\n`;

  msg += `Nom : ${params.customerName}\n`;
  msg += `Téléphone : ${params.customerPhone}\n`;
  msg += `Commune : ${params.deliveryCommune || params.deliveryCity || 'Abidjan'}\n`;
  msg += `Adresse : ${params.deliveryAddress}\n`;

  if (params.notes && params.notes.trim()) {
    msg += `Informations complémentaires : ${params.notes.trim()}\n`;
  }

  msg += `\nMerci.`;

  return msg;
}

