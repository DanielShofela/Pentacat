import React from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { WhatsAppOrderModal } from '../cart/WhatsAppOrderModal';
import { AuthModal } from '../auth/AuthModal';
import { ProductDetailModal } from '../store/ProductDetailModal';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { ClassicStoreView } from '../sections/ClassicStoreView';
import { InstallmentOverview } from '../sections/InstallmentOverview';
import { TontineOverview } from '../sections/TontineOverview';
import { CustomerPortalOverview } from '../sections/CustomerPortalOverview';
import { AdminDashboardOverview } from '../sections/AdminDashboardOverview';

export const MainLayout: React.FC = () => {
  const { activeDomain } = useAppNavigation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-sans antialiased selection:bg-amber-500 selection:text-white">
      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeDomain === 'store' && <ClassicStoreView />}
        {activeDomain === 'installment' && <InstallmentOverview />}
        {activeDomain === 'tontine' && <TontineOverview />}
        {activeDomain === 'customer' && <CustomerPortalOverview />}
        {activeDomain === 'admin' && <AdminDashboardOverview />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* WhatsApp Checkout Modal */}
      <WhatsAppOrderModal />

      {/* Firebase Auth Modal */}
      <AuthModal />

      {/* Product Multimodal Details Modal */}
      <ProductDetailModal />
    </div>
  );
};
