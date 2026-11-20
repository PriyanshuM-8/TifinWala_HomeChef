import React, { useState } from 'react';
import { X, CreditCard, ShieldAlert, Sparkles, Loader2, Zap } from 'lucide-react';
import walletService from '../../services/walletService';
import { extractErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { COMMISSION_MINIMUM_BALANCE_RUPEES } from '../../utils/constants';

export const RechargeModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [amount, setAmount] = useState('200');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [100, 200, 500, 1000];

  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 1. Standard Razorpay Checkout Flow
  const handleRecharge = async (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      addToast('Please enter an amount of at least ₹10', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create order on backend
      const orderData = await walletService.createCommissionRecharge(numAmount);
      const rzpOrderId = orderData?.order?.id || orderData?.razorpayOrderId;
      const rzpAmount = orderData?.order?.amount || orderData?.amountPaise || numAmount * 100;
      const rzpKey = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SXLkXgEKxGfXla';

      if (!rzpOrderId) {
        throw new Error('Failed to create recharge order from server.');
      }

      // Ensure Razorpay SDK script is available
      const scriptReady = await ensureRazorpayLoaded();
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK is not available. Please try Quick Test Recharge or refresh.');
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: rzpKey,
        amount: rzpAmount,
        currency: orderData?.order?.currency || orderData?.currency || 'INR',
        name: 'GharKaSwad',
        description: 'Chef Commission Wallet Recharge',
        order_id: rzpOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#14513F',
        },
        handler: async (response) => {
          try {
            // 3. Verify on backend
            await walletService.verifyCommissionRecharge({
              paymentId: orderData.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            addToast(`Commission Wallet recharged with ₹${numAmount} successfully!`, 'success');
            if (onSuccess) onSuccess();
            onClose();
          } catch (verifyErr) {
            addToast(extractErrorMessage(verifyErr, 'Payment verification failed.'), 'error');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        addToast(response.error?.description || 'Payment cancelled or failed.', 'error');
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to initiate recharge.'), 'error');
      setIsLoading(false);
    }
  };

  // 2. Quick Demo Recharge (Instant Test Credit)
  const handleDemoRecharge = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      addToast('Please enter an amount of at least ₹10', 'warning');
      return;
    }

    setIsDemoLoading(true);
    try {
      const orderData = await walletService.createCommissionRecharge(numAmount);
      const rzpOrderId = orderData?.order?.id || orderData?.razorpayOrderId || `order_demo_${Date.now()}`;
      const paymentId = orderData?.paymentId;

      await walletService.verifyCommissionRecharge({
        paymentId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: `pay_demo_${Date.now()}`,
        razorpaySignature: 'demo_success',
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_signature: 'demo_success',
      });

      addToast(`Commission Wallet recharged with ₹${numAmount} (Instant Credit)!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to complete instant recharge.'), 'error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8ECE7] p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading || isDemoLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#737B76] hover:text-[#27352F] hover:bg-[#F7F8F5] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F6A23A]/15 text-[#F6A23A] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 text-[#14513F]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#27352F]">
              Recharge Commission Wallet
            </h3>
            <p className="text-xs text-[#737B76]">
              Add funds for platform fee &amp; COD order security.
            </p>
          </div>
        </div>

        {/* COD Policy Notice */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">COD Order Requirement:</span> From your 2nd
            order onwards, a minimum available balance of{' '}
            <span className="font-extrabold text-[#14513F]">
              ₹{COMMISSION_MINIMUM_BALANCE_RUPEES}
            </span>{' '}
            is required in your Commission Wallet to accept Cash on Delivery orders.
          </div>
        </div>

        {/* Recharge Form */}
        <form onSubmit={handleRecharge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1.5">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-lg text-[#14513F]">
                ₹
              </span>
              <input
                type="number"
                min="10"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] text-lg font-bold text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  amount === String(q)
                    ? 'bg-[#14513F] text-white border-[#14513F] shadow-xs'
                    : 'bg-[#F7F8F5] text-[#27352F] border-[#E8ECE7] hover:bg-white'
                }`}
              >
                +₹{q}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isLoading || isDemoLoading || !amount || Number(amount) < 10}
              className="w-full py-3.5 rounded-2xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Razorpay...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F6A23A]" />
                  <span>Pay ₹{amount || 0} via Razorpay</span>
                </>
              )}
            </button>

            {/* Quick Demo Recharge Fallback */}
            {/* <button
              type="button"
              onClick={handleDemoRecharge}
              disabled={isLoading || isDemoLoading || !amount || Number(amount) < 10}
              className="w-full py-2.5 rounded-2xl bg-[#F6A23A]/15 hover:bg-[#F6A23A]/25 text-[#27352F] text-xs font-bold border border-[#F6A23A]/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#14513F]" />
                  <span>Crediting Wallet...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#F6A23A]" />
                  <span>Quick Test Recharge (+₹{amount || 0} Instant Credit)</span>
                </>
              )}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RechargeModal;
