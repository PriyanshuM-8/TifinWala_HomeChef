import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import ChefLayout from '../components/layout/ChefLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy-loaded pages for optimal performance and chunking
const ChefLoginPage = lazy(() => import('../pages/Authentication/ChefLoginPage'));
const ChefRegisterPage = lazy(() => import('../pages/Authentication/ChefRegisterPage'));
const ChefDashboardPage = lazy(() => import('../pages/Dashboard/ChefDashboardPage'));
const ChefFoodsPage = lazy(() => import('../pages/Foods/ChefFoodsPage'));
const ChefOrdersPage = lazy(() => import('../pages/Orders/ChefOrdersPage'));
const ChefOrderDetailPage = lazy(() => import('../pages/Orders/ChefOrderDetailPage'));
const ChefSubscriptionsPage = lazy(() => import('../pages/Subscriptions/ChefSubscriptionsPage'));
const ChefEarningsPage = lazy(() => import('../pages/Wallet/ChefEarningsPage'));
const ChefCommissionPage = lazy(() => import('../pages/Wallet/ChefCommissionPage'));
const ChefReviewsPage = lazy(() => import('../pages/Reviews/ChefReviewsPage'));
const ChefProfilePage = lazy(() => import('../pages/Profile/ChefProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="md" text="Loading screen..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<ChefLoginPage />} />
        <Route path="/register" element={<ChefRegisterPage />} />

        {/* Protected Partner Kitchen Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ChefLayout />}>
            <Route index element={<ChefDashboardPage />} />
            <Route path="foods" element={<ChefFoodsPage />} />
            <Route path="orders" element={<ChefOrdersPage />} />
            <Route path="orders/:orderId" element={<ChefOrderDetailPage />} />
            <Route path="subscriptions" element={<ChefSubscriptionsPage />} />
            <Route path="earnings" element={<ChefEarningsPage />} />
            <Route path="commission" element={<ChefCommissionPage />} />
            <Route path="reviews" element={<ChefReviewsPage />} />
            <Route path="profile" element={<ChefProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
