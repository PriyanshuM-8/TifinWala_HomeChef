import React, { useState } from 'react';
import { X, ArrowDownRight, AlertCircle, Loader2 } from 'lucide-react';
import payoutService from '../../services/payoutService';
import { extractErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const WithdrawModal = ({
  isOpen,
  onClose,
  onSuccess,
  availableBalance = 0,
  hasPayoutMethod = false,
  onConfigurePayout,
}) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      addToast('Please enter a valid withdrawal amount.', 'warning');
      return;
    }

    if (numAmount > availableBalance) {
      addToast(`Amount cannot exceed available balance of ${formatCurrency(availableBalance)}.`, 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await payoutService.requestWithdrawal(numAmount);
      addToast('Withdrawal request submitted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to submit withdrawal request.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8ECE7] p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#737B76] hover:text-[#27352F] hover:bg-[#F7F8F5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center font-bold">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#27352F]">
              Withdraw Earnings
            </h3>
            <p className="text-xs text-[#737B76]">
              Transfer funds directly into your verified bank account or UPI.
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#737B76] font-medium">Available to Withdraw</p>
            <p className="text-xl font-extrabold text-[#14513F] mt-0.5">
              {formatCurrency(availableBalance)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(availableBalance))}
            className="text-xs font-bold text-[#F6A23A] hover:underline cursor-pointer"
          >
            Withdraw All
          </button>
        </div>

        {/* Payout method check */}
        {!hasPayoutMethod ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">No payout method found.</p>
                <p className="mt-0.5 text-amber-800">
                  Please link your bank account or UPI ID before requesting a withdrawal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConfigurePayout();
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#14513F] text-white font-bold text-xs"
                >
                  Configure Payout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-lg text-[#14513F]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={availableBalance}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] text-lg font-bold text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !amount ||
                  Number(amount) <= 0 ||
                  Number(amount) > availableBalance
                }
                className="w-full py-3.5 rounded-2xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Request Payout of ₹{amount || 0}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal;
