/**
 * PENTA GAD Distribution
 * E-commerce Platform Architecture
 * 
 * Domains:
 * 1. Achat Classique (Direct Purchase + WhatsApp order + Local Cart)
 * 2. Paiement Échelonné (Installment credit + Simulation + Contracts)
 * 3. Tontine Rotative (Collective savings + Rotational allocation)
 * 4. Espace Client (Orders, Contracts & Tontines tracking)
 * 5. Administration (Catalog, Database sync, Metrics)
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppNavigationProvider } from './context/AppNavigationContext';
import { MainLayout } from './components/layout/MainLayout';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigationProvider>
          <MainLayout />
        </AppNavigationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
