import React, { useState, useEffect } from 'react';
import { X, Building2, Smartphone, Loader2 } from 'lucide-react';
import payoutService from '../../services/payoutService';
import { extractErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PayoutModal = ({ isOpen, onClose, onSuccess, currentDetails = null }) => {
  const { addToast } = useToast();
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentDetails) {
      setPayoutMethod(currentDetails.payoutMethod || 'bank_transfer');
      setFormData({
        accountHolderName: currentDetails.accountHolderName || '',
        accountNumber: '',
        ifscCode: currentDetails.maskedIfscCode || '',
        bankName: currentDetails.bankName || '',
        upiId: currentDetails.upiId || '',
      });
    } else {
      setFormData({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
      });
    }
    setErrors({});
  }, [currentDetails, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.accountHolderName.trim()) {
      errs.accountHolderName = 'Account holder name is required';
    }

    if (payoutMethod === 'bank_transfer') {
      if (!formData.accountNumber.trim()) {
        errs.accountNumber = 'Account number is required';
      }
      if (!formData.ifscCode.trim()) {
        errs.ifscCode = 'IFSC code is required';
      }
    } else {
      if (!formData.upiId.trim() || !formData.upiId.includes('@')) {
        errs.upiId = 'Valid UPI ID (e.g. name@okhdfcbank) is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        payoutMethod,
        accountHolderName: formData.accountHolderName.trim(),
        ...(payoutMethod === 'bank_transfer'
          ? {
              accountNumber: formData.accountNumber.trim(),
              ifscCode: formData.ifscCode.trim().toUpperCase(),
              bankName: formData.bankName.trim(),
            }
          : {
              upiId: formData.upiId.trim().toLowerCase(),
            }),
      };

      await payoutService.savePayoutDetails(payload);
      addToast('Payout details saved successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update payout details.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E8ECE7] p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#737B76] hover:text-[#27352F] hover:bg-[#F7F8F5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#27352F]">
            Configure Payout Method
          </h3>
          <p className="text-xs text-[#737B76] mt-0.5">
            Earnings withdrawals will be automatically transferred to this destination.
          </p>
        </div>

        {/* Method Toggle Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setPayoutMethod('bank_transfer')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition cursor-pointer ${
              payoutMethod === 'bank_transfer'
                ? 'bg-[#14513F] text-white border-[#14513F] shadow-xs'
                : 'bg-[#F7F8F5] text-[#27352F] border-[#E8ECE7] hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Account</span>
          </button>

          <button
            type="button"
            onClick={() => setPayoutMethod('upi')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition cursor-pointer ${
              payoutMethod === 'upi'
                ? 'bg-[#14513F] text-white border-[#14513F] shadow-xs'
                : 'bg-[#F7F8F5] text-[#27352F] border-[#E8ECE7] hover:bg-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI ID (Instant)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
              Account Holder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) =>
                setFormData({ ...formData, accountHolderName: e.target.value })
              }
              placeholder="e.g. Ramesh Kumar Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            />
            {errors.accountHolderName && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {errors.accountHolderName}
              </p>
            )}
          </div>

          {payoutMethod === 'bank_transfer' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                  Bank Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="Enter your bank account number"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                />
                {errors.accountNumber && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="HDFC0001234"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] uppercase transition"
                  />
                  {errors.ifscCode && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      {errors.ifscCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
                UPI ID (VPA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) =>
                  setFormData({ ...formData, upiId: e.target.value.toLowerCase() })
                }
                placeholder="ramesh@okhdfcbank"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
              />
              {errors.upiId && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.upiId}
                </p>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#E8ECE7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-[#E8ECE7] text-sm font-semibold text-[#27352F] hover:bg-[#F7F8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-sm font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Payout Method</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutModal;
