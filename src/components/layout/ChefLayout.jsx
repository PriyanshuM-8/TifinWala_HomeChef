import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import BottomNav from '../common/BottomNav';
import PendingApprovalBanner from '../common/PendingApprovalBanner';
import IncomingOrderModal from '../order/IncomingOrderModal';
import { useAuth } from '../../context/AuthContext';

export const ChefLayout = () => {
  const { approvalStatus } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#27352F] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (hidden on mobile & tablet) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Navbar />

        {/* Content Container with bottom padding for mobile navigation */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 bottom-nav-safe lg:pb-8">
          {/* Approval Banner if kitchen is pending or rejected */}
          <PendingApprovalBanner status={approvalStatus} />

          {/* Child route views */}
          <Outlet />
        </main>

        {/* Mobile & Tablet Fixed Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Incoming Live Order Ringing Alert Modal */}
      <IncomingOrderModal />
    </div>
  );
};

export default ChefLayout;
