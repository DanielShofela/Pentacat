import React, { createContext, useContext, useState, useEffect } from 'react';
import { CompanySettings } from '../types/settings';
import { companySettingsService, DEFAULT_COMPANY_SETTINGS } from '../services/companySettingsService';

interface CompanySettingsContextType {
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<CompanySettings>;
  cleanWhatsAppNumber: string;
  buildWhatsAppUrl: (message: string) => string;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

export const CompanySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(companySettingsService.getSettings());

  useEffect(() => {
    // Initial fetch from Firestore
    companySettingsService.fetchSettings();

    // Subscribe to updates
    const unsubscribe = companySettingsService.subscribe((updated) => {
      setSettings({ ...updated });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    const updated = await companySettingsService.updateSettings(newSettings);
    setSettings({ ...updated });
    return updated;
  };

  const cleanWhatsAppNumber = companySettingsService.getCleanWhatsAppNumber(settings.whatsappNumber);

  const buildWhatsAppUrl = (message: string) => {
    return companySettingsService.buildWhatsAppUrl(message, settings.whatsappNumber);
  };

  return (
    <CompanySettingsContext.Provider
      value={{
        settings,
        updateSettings,
        cleanWhatsAppNumber,
        buildWhatsAppUrl,
      }}
    >
      {children}
    </CompanySettingsContext.Provider>
  );
};

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      settings: DEFAULT_COMPANY_SETTINGS,
      updateSettings: async () => DEFAULT_COMPANY_SETTINGS,
      cleanWhatsAppNumber: '2250703397921',
      buildWhatsAppUrl: (msg: string) => `https://wa.me/2250703397921?text=${encodeURIComponent(msg)}`,
    };
  }
  return context;
}
