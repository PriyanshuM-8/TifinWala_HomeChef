import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import walletService from '../../services/walletService';
import payoutService from '../../services/payoutService';
import {
  formatCurrency,
  formatDateTime,
  formatDate,
} from '../../utils/formatters';
import PayoutModal from '../../components/wallet/PayoutModal';
import WithdrawModal from '../../components/wallet/WithdrawModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const ChefEarningsPage = () => {
  const { addToast } = useToast();

  const [earningsData, setEarningsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payoutDetails, setPayoutDetails] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const fetchEarningsAndPayouts = useCallback(async () => {
    try {
      const [walletRes, transRes, payoutRes, withRes] = await Promise.allSettled([
        walletService.getEarningsOverview(),
        walletService.getEarningsTransactions({ limit: 30 }),
        payoutService.getPayoutDetails(),
        payoutService.getWithdrawals({ limit: 20 }),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.success) {
        setEarningsData(walletRes.value);
      }

      if (transRes.status === 'fulfilled') {
        const list = transRes.value.earnings || transRes.value.transactions || [];
        setTransactions(list);
      }

      if (payoutRes.status === 'fulfilled' && payoutRes.value?.payoutDetails) {
        setPayoutDetails(payoutRes.value.payoutDetails);
      } else {
        setPayoutDetails(null);
      }

      if (withRes.status === 'fulfilled' && withRes.value?.withdrawals) {
        setWithdrawals(withRes.value.withdrawals);
      }
    } catch (err) {
      console.error('Failed to load earnings data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsAndPayouts();
  }, [fetchEarningsAndPayouts]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading Chef Earnings Wallet..." />
      </div>
    );
  }

  const balances =
    earningsData?.balancesRupees ||
    earningsData?.data?.balancesRupees ||
    earningsData?.wallet ||
    earningsData?.data?.wallet ||
    {};
  const availableBal =
    balances.availableBalance ??
    earningsData?.availableBalance ??
    earningsData?.data?.availableBalance ??
    0;
  const totalEarned =
    balances.totalEarned ??
    earningsData?.totalEarned ??
    earningsData?.data?.totalEarned ??
    0;
  const pendingBal =
    balances.pendingBalance ??
    earningsData?.pendingBalance ??
    earningsData?.data?.pendingBalance ??
    0;
  const settledBal =
    balances.settledBalance ??
    earningsData?.settledBalance ??
    earningsData?.data?.settledBalance ??
    0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
              Chef Earnings Wallet
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#14513F]/10 text-[#14513F]">
              Revenue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Track revenue from delivered food orders, subscriptions, and withdraw your funds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchEarningsAndPayouts();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] hover:border-[#14513F]/30 transition"
            title="Refresh Earnings"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
          </button>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            disabled={availableBal <= 0}
            className="px-5 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <ArrowDownRight className="w-4 h-4 text-[#F6A23A]" />
            <span>Withdraw Earnings</span>
          </button>
        </div>
      </div>

      {/* Main Balances Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Available to Withdraw */}
        <div className="p-5 rounded-2xl bg-[#14513F] text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-[#F6A23A]" />
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(availableBal)}
            </p>
            <p className="text-[11px] text-white/70 mt-1">
              Ready for immediate payout
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(totalEarned)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Lifetime gross earnings
            </p>
          </div>
        </div>

        {/* Pending In-Progress Orders */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Pending Balance</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(pendingBal)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Confirmed upon customer delivery
            </p>
          </div>
        </div>

        {/* Settled / Withdrawn */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#737B76]">
            <span>Settled / Paid Out</span>
            <CheckCircle2 className="w-4 h-4 text-[#14513F]" />
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-[#27352F]">
              {formatCurrency(settledBal)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-1">
              Transferred to your bank/UPI
            </p>
          </div>
        </div>
      </div>

      {/* Linked Payout Method Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center justify-center text-[#14513F]">
              {payoutDetails?.payoutMethod === 'upi' ? (
                <Smartphone className="w-6 h-6" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#27352F]">
                  Linked Payout Destination
                </h3>
                {payoutDetails ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Not Linked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737B76] mt-0.5">
                {payoutDetails
                  ? payoutDetails.payoutMethod === 'upi'
                    ? `UPI ID: ${payoutDetails.upiId} (${payoutDetails.accountHolderName})`
                    : `Bank: ${payoutDetails.bankName || 'Bank Account'} ••••${payoutDetails.maskedAccountNumber || ''} (IFSC: ${payoutDetails.maskedIfscCode || 'Verified'})`
                  : 'Link a bank account or UPI ID to enable withdrawal transfers.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPayoutModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] hover:border-[#14513F]/30 text-xs font-bold text-[#27352F] transition self-start sm:self-auto cursor-pointer"
          >
            {payoutDetails ? 'Edit Payout Details' : 'Configure Payout Details'}
          </button>
        </div>
      </div>

      {/* Order Earnings History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
            Delivered Orders &amp; Earnings
          </h2>
          <span className="text-xs font-semibold text-[#737B76]">
            {transactions.length} record{transactions.length === 1 ? '' : 's'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8ECE7] text-center text-xs text-[#737B76]">
            No delivered order earnings recorded yet. Once you complete orders, your revenue breakdown will appear here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E8ECE7]">
              {transactions.map((tx) => {
                const netAmount = (tx.netEarningsPaise || tx.grossAmountPaise || 0) / 100;
                const grossAmount = (tx.grossAmountPaise || 0) / 100;
                const commAmount = (tx.commissionDeductedPaise || 0) / 100;
                const orderNum = tx.orderNumber || tx.orderId?.orderNumber || tx.earningNumber;

                return (
                  <div
                    key={tx._id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#F7F8F5]/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#27352F]">
                            Order #{orderNum}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              tx.status === 'available' || tx.status === 'settled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.status === 'available' ? 'Withdrawable' : tx.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#737B76] mt-0.5">
                          {formatDateTime(tx.createdAt || tx.availableAt)}
                          {tx.sourceType && ` • ${tx.sourceType.replace(/_/g, ' ')}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <p className="font-black text-sm text-emerald-700">
                        +{formatCurrency(netAmount)}
                      </p>
                      <p className="text-[10px] text-[#737B76]">
                        Gross: {formatCurrency(grossAmount)}
                        {commAmount > 0 && ` (Comm: -${formatCurrency(commAmount)})`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Withdrawals Ledger */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
          Recent Withdrawal Requests
        </h2>

        {withdrawals.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8ECE7] text-center text-xs text-[#737B76]">
            No withdrawal requests made yet. When you request a payout, status and tracking will be shown here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E8ECE7]">
              {withdrawals.map((w) => (
                <div
                  key={w._id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center font-bold">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#27352F]">
                        {formatCurrency(w.amountRupees ?? w.amount)}
                      </p>
                      <p className="text-[#737B76]">
                        {formatDateTime(w.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                      w.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {w.status || 'Pending Processing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      <PayoutModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        onSuccess={fetchEarningsAndPayouts}
        currentDetails={payoutDetails}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={fetchEarningsAndPayouts}
        availableBalance={availableBal}
        hasPayoutMethod={!!payoutDetails}
        onConfigurePayout={() => setPayoutModalOpen(true)}
      />
    </div>
  );
};

export default ChefEarningsPage;
