import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import walletService from '../../services/walletService';
import {
  formatCurrency,
  formatDateTime,
} from '../../utils/formatters';
import { COMMISSION_MINIMUM_BALANCE_RUPEES } from '../../utils/constants';
import RechargeModal from '../../components/wallet/RechargeModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Coins,
  CreditCard,
  ShieldAlert,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Gift,
} from 'lucide-react';

export const ChefCommissionPage = () => {
  const { addToast } = useToast();

  const [commissionData, setCommissionData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  const fetchCommissionData = useCallback(async () => {
    try {
      const [walletRes, transRes] = await Promise.allSettled([
        walletService.getCommissionOverview(),
        walletService.getCommissionTransactions({ limit: 40 }),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.success) {
        setCommissionData(walletRes.value);
      }

      if (transRes.status === 'fulfilled') {
        const list =
          transRes.value.transactions || transRes.value.data || [];
        setTransactions(list);
      }
    } catch (err) {
      console.error('Failed to load commission data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissionData();
  }, [fetchCommissionData]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading Chef Commission Wallet..." />
      </div>
    );
  }

  const balances =
    commissionData?.balancesRupees ||
    commissionData?.data?.balancesRupees ||
    commissionData?.commissionWallet ||
    commissionData?.data?.commissionWallet ||
    {};
  const totalBalance = balances.balance ?? commissionData?.balance ?? commissionData?.data?.balance ?? 0;
  const availableBalance = balances.availableBalance ?? commissionData?.availableBalance ?? commissionData?.data?.availableBalance ?? 0;
  const reservedBalance = balances.reservedBalance ?? commissionData?.reservedBalance ?? commissionData?.data?.reservedBalance ?? 0;
  const totalCommissionPaid = balances.totalCommissionPaid ?? commissionData?.totalCommissionPaid ?? commissionData?.data?.totalCommissionPaid ?? 0;

  const hasFirstOrderFree = !(commissionData?.hasUsedFirstOrderFreeBenefit ?? commissionData?.data?.hasUsedFirstOrderFreeBenefit);
  const isMinimumSatisfied =
    commissionData?.isMinimumBalanceSatisfied ??
    commissionData?.data?.isMinimumBalanceSatisfied ??
    (availableBalance >= COMMISSION_MINIMUM_BALANCE_RUPEES || hasFirstOrderFree);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
              Chef Commission Wallet
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F6A23A]/15 text-[#14513F]">
              Platform Reserve
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Prepaid balance for platform service fees and Cash on Delivery security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchCommissionData();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] hover:border-[#14513F]/30 transition"
            title="Refresh Commission Wallet"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
          </button>

          <button
            onClick={() => setRechargeModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
          >
            <CreditCard className="w-4 h-4 text-[#F6A23A]" />
            <span>Recharge Wallet</span>
          </button>
        </div>
      </div>

      {/* Mandatory COD Rule & First Order Free Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COD Policy Box */}
        <div
          className={`p-5 rounded-2xl border ${
            !isMinimumSatisfied
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-white border-[#E8ECE7] text-[#27352F]'
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                !isMinimumSatisfied ? 'text-rose-600' : 'text-[#14513F]'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  COD ₹{COMMISSION_MINIMUM_BALANCE_RUPEES} Minimum Balance Rule
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isMinimumSatisfied
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isMinimumSatisfied ? 'Requirement Met' : 'Action Needed'}
                </span>
              </div>
              <p className="text-xs text-[#737B76] mt-1 leading-relaxed">
                From your 2nd order onwards, you must maintain at least ₹{COMMISSION_MINIMUM_BALANCE_RUPEES} in available balance to accept Cash on Delivery orders.
              </p>
            </div>
          </div>
        </div>

        {/* First Order Benefit Box */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#F6A23A]/15 text-[#F6A23A] shrink-0">
            <Gift className="w-5 h-5 text-[#14513F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#27352F]">
                1st Order Free Commission Benefit
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  hasFirstOrderFree
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-[#737B76]'
                }`}
              >
                {hasFirstOrderFree ? 'Available' : 'Claimed'}
              </span>
            </div>
            <p className="text-xs text-[#737B76] mt-1 leading-relaxed">
              {hasFirstOrderFree
                ? 'Your very first customer order on GharKaSwad has 0% platform commission with no minimum balance required!'
                : 'You have utilized your welcome 1st order free benefit.'}
            </p>
          </div>
        </div>
      </div>

      {/* Commission Balances Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Available Commission */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Available Balance</span>
            <Coins className="w-4 h-4 text-[#F6A23A]" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#14513F]">
              {formatCurrency(availableBalance)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Available for new orders
            </p>
          </div>
        </div>

        {/* Reserved Balance */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Reserved Balance</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(reservedBalance)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Held for active cooking orders
            </p>
          </div>
        </div>

        {/* Total Wallet Balance */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Total Balance</span>
            <Coins className="w-4 h-4 text-[#14513F]" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Available + Reserved
            </p>
          </div>
        </div>

        {/* Total Commission Paid */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Commission Paid</span>
            <CheckCircle2 className="w-4 h-4 text-[#14513F]" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(totalCommissionPaid)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Lifetime platform fees
            </p>
          </div>
        </div>
      </div>

      {/* Commission Transactions Ledger */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
          Commission Wallet Activity
        </h2>

        {transactions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8ECE7] text-center text-xs text-[#737B76]">
            No wallet transactions yet. When you recharge or accept orders, line entries will appear here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E8ECE7]">
              {transactions.map((tx, idx) => {
                const isCredit =
                  tx.type === 'recharge' || tx.type === 'refund' || tx.amount > 0;

                return (
                  <div
                    key={tx._id || idx}
                    className="p-4 sm:px-6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          isCredit
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#27352F] capitalize">
                          {tx.type || 'Transaction'}
                        </p>
                        <p className="text-[#737B76]">
                          {tx.description || formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          isCredit ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(Math.abs(tx.amountRupees ?? tx.amount))}
                      </span>
                      <p className="text-[10px] text-[#737B76]">
                        {formatDateTime(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        onSuccess={fetchCommissionData}
      />
    </div>
  );
};

export default ChefCommissionPage;
