import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ORDER_REJECTION_REASONS } from '../../utils/constants';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  requireReason = false,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason) {
      const finalReason =
        selectedReason === 'Other (specify below)'
          ? customReason.trim()
          : (selectedReason || customReason.trim());
      if (!finalReason) return;
      onConfirm(finalReason);
    } else {
      onConfirm();
    }
  };

  const isConfirmDisabled =
    isLoading ||
    (requireReason &&
      (!selectedReason ||
        (selectedReason === 'Other (specify below)' && !customReason.trim())));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E8ECE7] p-5 sm:p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#737B76] hover:text-[#27352F] hover:bg-[#F7F8F5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-[#14513F]'
            }`}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#27352F]">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#737B76] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Required Reason Input (for order rejection) */}
        {requireReason && (
          <div className="my-4 space-y-3">
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider">
              Reason for Rejection <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            >
              <option value="">-- Select a reason --</option>
              {ORDER_REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {selectedReason === 'Other (specify below)' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please explain the specific reason..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition resize-none"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#E8ECE7]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#E8ECE7] text-sm font-semibold text-[#27352F] hover:bg-[#F7F8F5] transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#14513F] hover:bg-[#0E3B2E]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
