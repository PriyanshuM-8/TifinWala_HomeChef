import React, { useState } from 'react';
import {
  Bell,
  UtensilsCrossed,
  MapPin,
  Truck,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  CreditCard,
  Banknote,
  Volume2,
  VolumeX,
  X,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { useOrderAlert } from '../../context/OrderAlertContext';
import { formatCurrency } from '../../utils/formatters';
import RechargeModal from '../wallet/RechargeModal';

export const IncomingOrderModal = () => {
  const {
    incomingOrder,
    soundEnabled,
    toggleSound,
    dismissAlert,
    acceptOrder,
    rejectOrder,
    isProcessingAction,
  } = useOrderAlert();

  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('Kitchen currently at maximum cooking capacity');
  const [actionError, setActionError] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  if (!incomingOrder) return null;

  const orderId = incomingOrder.orderId || incomingOrder._id;
  const items = Array.isArray(incomingOrder.items) ? incomingOrder.items : [];
  const isCOD = incomingOrder.paymentMethod === 'cod';
  const isTakeaway = incomingOrder.deliveryType === 'takeaway' || incomingOrder.deliveryType === 'customer_pickup';

  const handleAccept = async () => {
    setActionError(null);
    const result = await acceptOrder(orderId);
    if (!result?.success) {
      setActionError(result?.message || 'Failed to accept order.');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    await rejectOrder(orderId, rejectReason.trim());
    setRejecting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-order-title"
    >
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#F6A23A] max-h-[92vh] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Pulsing Alert Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8ECE7]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-[#F6A23A] text-white flex items-center justify-center shadow-md animate-bounce">
                <Bell className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="incoming-order-title" className="text-lg sm:text-xl font-extrabold text-[#14513F] leading-tight">
                  New Order Received!
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[#F6A23A]/20 text-[#14513F] text-[10px] font-black uppercase">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-[#737B76] font-mono mt-0.5">
                Order #{incomingOrder.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute ringtone' : 'Unmute ringtone'}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dismiss Button */}
            <button
              onClick={dismissAlert}
              className="p-2 rounded-xl text-[#737B76] hover:bg-[#F7F8F5] transition-colors"
              title="Review in background"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Order Summary Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Payment Method Badge */}
            <div className="p-3 rounded-2xl bg-white border border-[#E8ECE7] flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isCOD ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isCOD ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#737B76]">Payment</p>
                <p className="text-xs font-black text-[#27352F] truncate">
                  {isCOD ? 'Cash On Delivery' : 'Online (Prepaid)'}
                </p>
              </div>
            </div>

            {/* Delivery Mode Badge */}
            <div className="p-3 rounded-2xl bg-white border border-[#E8ECE7] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#14513F] flex items-center justify-center shrink-0">
                {isTakeaway ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#737B76]">Mode</p>
                <p className="text-xs font-black text-[#27352F] truncate">
                  {isTakeaway ? 'Customer Pickup' : 'Home Delivery'}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Dishes List */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8ECE7] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#737B76] uppercase tracking-wider pb-2 border-b border-[#E8ECE7]">
              <span>Prepared Dishes ({items.length})</span>
              <span>Amount</span>
            </div>

            <div className="divide-y divide-[#E8ECE7]/60 max-h-40 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-xs text-[#737B76] py-2">Standard fresh meal order</p>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-[#14513F]/10 text-[#14513F] font-black text-[11px] flex items-center justify-center shrink-0">
                        {it.quantity}x
                      </span>
                      <span className="font-semibold text-[#27352F] truncate">
                        {it.foodName || it.name || 'Dish'}
                      </span>
                    </div>
                    <span className="font-bold text-[#14513F] shrink-0">
                      {formatCurrency(it.itemTotal || (it.unitPrice || it.price || 0) * (it.quantity || 1))}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Total Highlight */}
            <div className="pt-2.5 border-t border-[#E8ECE7] flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#27352F]">Order Total</span>
              <span className="text-lg font-black text-[#14513F]">
                {formatCurrency(incomingOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Delivery / Address Information Snapshot */}
          {incomingOrder.deliveryAddressSnapshot && (
            <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#14513F]">
                <MapPin className="w-3.5 h-3.5 text-[#F6A23A]" />
                <span>Delivery Destination:</span>
              </div>
              <p className="text-[#27352F] font-medium leading-relaxed pl-5">
                {incomingOrder.deliveryAddressSnapshot.addressLine || incomingOrder.deliveryAddressSnapshot.addressLine1},{' '}
                {incomingOrder.deliveryAddressSnapshot.city} ({incomingOrder.deliveryAddressSnapshot.pincode})
              </p>
            </div>
          )}

          {/* Rejection Form Modal / Drawer (if user clicked decline) */}
          {rejecting && (
            <form onSubmit={handleConfirmReject} className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2.5">
              <p className="text-xs font-bold text-rose-900">
                Please specify why you cannot accept this order:
              </p>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white border border-rose-300 text-rose-950 focus:outline-none"
              >
                <option value="Kitchen currently at maximum cooking capacity">
                  Kitchen at maximum cooking capacity
                </option>
                <option value="Required fresh ingredients out of stock">
                  Required fresh ingredients out of stock
                </option>
                <option value="Kitchen closing for the day">Kitchen closing for the day</option>
                <option value="Delivery address is beyond my current operational reach">
                  Delivery address beyond current reach
                </option>
              </select>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="flex-1 py-2 rounded-xl border border-rose-300 bg-white text-xs font-semibold text-rose-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm disabled:opacity-50"
                >
                  {isProcessingAction ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Action Controls */}
        {!rejecting && (
          <div className="space-y-2.5">
            {actionError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#27352F] flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F6A23A] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{actionError}</span>
                </div>
                {(actionError.toLowerCase().includes('commission') ||
                  actionError.toLowerCase().includes('recharge') ||
                  actionError.toLowerCase().includes('balance')) && (
                  <button
                    type="button"
                    onClick={() => setShowRechargeModal(true)}
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14513F] text-white text-xs font-bold hover:bg-[#0E3B2E] transition shadow-sm"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#F6A23A]" />
                    Recharge Commission Wallet Now
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-[#E8ECE7] flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={isProcessingAction}
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-rose-200 text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Decline Order</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={isProcessingAction}
                className="flex-2 py-3 px-5 rounded-2xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F6A23A]" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#F6A23A]" />
                    <span>Accept & Start Preparation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recharge Modal Popup for Instant In-place Top-Up */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onRechargeSuccess={() => {
            setShowRechargeModal(false);
            setActionError(null);
          }}
        />
      )}
    </div>
  );
};

export default IncomingOrderModal;
