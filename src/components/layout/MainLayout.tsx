import React from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { WhatsAppOrderModal } from '../cart/WhatsAppOrderModal';
import { AuthModal } from '../auth/AuthModal';
import { ProductDetailModal } from '../store/ProductDetailModal';
import { ProductSheet } from '../catalog/ProductSheet';
import { ToastContainer } from '../ui/Toast';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { ClassicStoreView } from '../sections/ClassicStoreView';
import { CatalogPage } from '../catalog/CatalogPage';
import { InstallmentOverview } from '../sections/InstallmentOverview';
import { TontineOverview } from '../sections/TontineOverview';
import { CustomerPortalOverview } from '../sections/CustomerPortalOverview';
import { AdminDashboardOverview } from '../sections/AdminDashboardOverview';

export const MainLayout: React.FC = () => {
  const { activeDomain, selectedProductDetail, setSelectedProductDetail } = useAppNavigation();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-slate-900 font-sans antialiased selection:bg-slate-950 selection:text-[#C5A059]">
      {/* Global Modern Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedProductDetail ? (
          <ProductSheet
            product={selectedProductDetail}
            onBack={() => setSelectedProductDetail(null)}
          />
        ) : (
          <>
            {activeDomain === 'store' && <ClassicStoreView />}
            {activeDomain === 'catalog' && <CatalogPage />}
            {activeDomain === 'installment' && <InstallmentOverview />}
            {activeDomain === 'tontine' && <TontineOverview />}
            {activeDomain === 'customer' && <CustomerPortalOverview />}
            {activeDomain === 'admin' && <AdminDashboardOverview />}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* WhatsApp Checkout Modal */}
      <WhatsAppOrderModal />

      {/* Firebase Auth Modal */}
      <AuthModal />

      {/* Product Quick Details Modal */}
      <ProductDetailModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
