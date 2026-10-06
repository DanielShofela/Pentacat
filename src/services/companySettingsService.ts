import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CompanySettings } from '../types/settings';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'PENTA GAD Distribution',
  whatsappNumber: '+2250703397921',
  phoneDisplay: '+225 07 03 39 79 21',
  email: 'pentagad.distribution@gmail.com',
  address: "Abidjan, Côte d'Ivoire - Showroom & Entrepôt Central",
  openingHours: 'Lun - Sam : 08h00 - 18h30',
  standardDeliveryFee: 3000,
  freeDeliveryThreshold: 200000,
};

const SETTINGS_STORAGE_KEY = 'pentagad_company_settings_v1';
const SETTINGS_DOC_ID = 'company';
const SETTINGS_COLLECTION = 'settings';

class CompanySettingsService {
  private currentSettings: CompanySettings = DEFAULT_COMPANY_SETTINGS;
  private listeners: Set<(settings: CompanySettings) => void> = new Set();
  private initialized = false;

  constructor() {
    this.loadFromLocal();
  }

  private loadFromLocal() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        this.currentSettings = { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      this.currentSettings = DEFAULT_COMPANY_SETTINGS;
    }
  }

  public getSettings(): CompanySettings {
    return this.currentSettings;
  }

  public async fetchSettings(): Promise<CompanySettings> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as CompanySettings;
        this.currentSettings = { ...DEFAULT_COMPANY_SETTINGS, ...data };
      } else {
        // If not created yet in Firestore, initialize it with defaults
        await setDoc(docRef, {
          ...DEFAULT_COMPANY_SETTINGS,
          updatedAt: new Date().toISOString(),
        });
        this.currentSettings = DEFAULT_COMPANY_SETTINGS;
      }
      this.persistAndNotify();
    } catch (e) {
      console.warn('Could not fetch settings from Firestore, using cached/default settings:', e);
    }
    this.initialized = true;
    return this.currentSettings;
  }

  public async updateSettings(updates: Partial<CompanySettings>): Promise<CompanySettings> {
    const updated: CompanySettings = {
      ...this.currentSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.currentSettings = updated;
    this.persistAndNotify();

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Could not save settings to Firestore:', err);
    }

    return this.currentSettings;
  }

  private persistAndNotify() {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.currentSettings));
    } catch {
      // ignore local storage errors
    }
    this.listeners.forEach((listener) => listener(this.currentSettings));
  }

  public subscribe(listener: (settings: CompanySettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentSettings);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCleanWhatsAppNumber(rawNumber?: string): string {
    const target = rawNumber || this.currentSettings.whatsappNumber;
    let cleaned = target.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '225' + cleaned;
    } else if (!cleaned.startsWith('225') && cleaned.length === 8) {
      cleaned = '225' + cleaned;
    }
    return cleaned;
  }

  public buildWhatsAppUrl(message: string, customPhone?: string): string {
    const phone = this.getCleanWhatsAppNumber(customPhone);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}

export const companySettingsService = new CompanySettingsService();
