import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import walletService from '../../services/walletService';
import { formatCurrency } from '../../utils/formatters';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  Wallet,
  Coins,
  Star,
  User,
  LogOut,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { APPROVAL_STATUS_CONFIG, COMMISSION_MINIMUM_BALANCE_RUPEES } from '../../utils/constants';

export const Sidebar = () => {
  const { user, chefProfile, approvalStatus, logout } = useAuth();
  const [earningsBal, setEarningsBal] = useState(null);
  const [commissionBal, setCommissionBal] = useState(null);
  const [isCommissionLow, setIsCommissionLow] = useState(false);

  const statusConfig = APPROVAL_STATUS_CONFIG[approvalStatus] || APPROVAL_STATUS_CONFIG.pending;
  const kitchenName = chefProfile?.kitchenName || user?.name || 'Home Kitchen';

  useEffect(() => {
    let isMounted = true;
    const fetchBalances = async () => {
      try {
        const [earnRes, commRes] = await Promise.allSettled([
          walletService.getEarningsOverview(),
          walletService.getCommissionOverview(),
        ]);

        if (isMounted) {
          if (earnRes.status === 'fulfilled' && earnRes.value?.success) {
            setEarningsBal(earnRes.value.balancesRupees?.availableBalance ?? earnRes.value.wallet?.availableBalance ?? 0);
          }
          if (commRes.status === 'fulfilled' && commRes.value?.success) {
            const avail = commRes.value.balancesRupees?.availableBalance ?? 0;
            setCommissionBal(avail);
            setIsCommissionLow(avail < COMMISSION_MINIMUM_BALANCE_RUPEES && commRes.value.hasUsedFirstOrderFreeBenefit);
          }
        }
      } catch {
        // Silent catch for sidebar preview
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Food Menu', path: '/foods', icon: UtensilsCrossed },
    { name: 'Customer Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Subscription Meals', path: '/subscriptions', icon: CalendarDays },
    { name: 'Earnings Wallet', path: '/earnings', icon: Wallet },
    {
      name: 'Commission Wallet',
      path: '/commission',
      icon: Coins,
      alert: isCommissionLow,
    },
    { name: 'Kitchen Reviews', path: '/reviews', icon: Star },
    { name: 'Kitchen Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-[#E8ECE7] h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E8ECE7]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#14513F] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0E3B2E] transition">
            <UtensilsCrossed className="w-6 h-6 text-[#F6A23A]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-[#14513F] leading-none">
              GharKa<span className="text-[#F6A23A]">Swad</span>
            </h1>
            <p className="text-[11px] font-semibold text-[#737B76] mt-1 tracking-wider uppercase">
              Partner Kitchen
            </p>
          </div>
        </Link>

        {/* Kitchen Status Card */}
        <div className="mt-4 p-3 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#27352F] truncate max-w-[130px]">
              {kitchenName}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
            >
              {approvalStatus === 'approved' ? 'Verified' : 'Pending'}
            </span>
          </div>
          <p className="text-[11px] text-[#737B76] truncate">
            {chefProfile?.city || 'HomeChef Partner'}
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group ${
                  isActive
                    ? 'bg-[#14513F] text-white shadow-xs'
                    : 'text-[#27352F] hover:bg-[#F7F8F5] hover:text-[#14513F]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-[#F6A23A]' : 'text-[#737B76]'
                      }`}
                    />
                    <span>{link.name}</span>
                  </div>
                  {link.alert && (
                    <span
                      title="Low COD balance alert"
                      className="w-2 h-2 rounded-full bg-rose-500 animate-ping"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Wallet Quick Summary Widget */}
      <div className="p-4 border-t border-[#E8ECE7] bg-[#F7F8F5]/60 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Earnings */}
          <Link
            to="/earnings"
            className="p-2.5 rounded-xl bg-white border border-[#E8ECE7] hover:border-[#14513F]/40 transition group"
          >
            <div className="flex items-center justify-between text-[10px] text-[#737B76] font-medium">
              <span>Earnings</span>
              <ArrowUpRight className="w-3 h-3 text-[#14513F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <p className="text-xs font-bold text-[#14513F] mt-0.5">
              {earningsBal !== null ? formatCurrency(earningsBal) : '...'}
            </p>
          </Link>

          {/* Commission */}
          <Link
            to="/commission"
            className={`p-2.5 rounded-xl bg-white border transition group ${
              isCommissionLow
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-[#E8ECE7] hover:border-[#F6A23A]/40'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-[#737B76] font-medium">
              <span>Commission</span>
              <ArrowUpRight className="w-3 h-3 text-[#F6A23A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <p className={`text-xs font-bold mt-0.5 ${isCommissionLow ? 'text-rose-600' : 'text-[#27352F]'}`}>
              {commissionBal !== null ? formatCurrency(commissionBal) : '...'}
            </p>
          </Link>
        </div>

        {/* Low COD Alert banner if below ₹50 */}
        {isCommissionLow && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>Balance &lt; ₹50 (COD disabled)</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
