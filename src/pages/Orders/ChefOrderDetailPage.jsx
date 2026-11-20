import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import orderService from '../../services/orderService';
import { extractErrorMessage } from '../../services/api';
import {
  formatCurrency,
  formatDateTime,
  formatPhone,
} from '../../utils/formatters';
import {
  ORDER_STATUS_CONFIG,
  ORDER_STATUS,
} from '../../utils/constants';
import OrderStatusStepper from '../../components/order/OrderStatusStepper';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Clock,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Bike,
  CheckCircle,
  XCircle,
  CreditCard,
  MessageSquare,
  Flame,
  AlertCircle,
} from 'lucide-react';

export const ChefOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const res = await orderService.getOrderDetails(orderId);
      const fetchedOrder = res?.order || res?.data || null;
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      }
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to load order details.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [orderId, addToast]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await orderService.acceptOrder(orderId);
      addToast('Order accepted! Please begin cooking on schedule.', 'success');
      fetchOrderDetails();
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to accept order. Check Commission Wallet balance.',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    setIsProcessing(true);
    try {
      await orderService.rejectOrder(orderId, reason);
      addToast('Order rejected.', 'info');
      setRejectModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to reject order.'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setIsProcessing(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      addToast(`Order marked as ${status.replace(/_/g, ' ')}!`, 'success');
      fetchOrderDetails();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update order status.'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-[#E8ECE7] p-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#27352F]">Order Not Found</h2>
        <p className="text-xs text-[#737B76] mt-1 mb-4">
          This order could not be located or you do not have permission to view it.
        </p>
        <Link
          to="/orders"
          className="px-4 py-2 rounded-xl bg-[#14513F] text-white text-xs font-bold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatus = order.orderStatus || order.status || 'pending_confirmation';
  const statusConfig =
    ORDER_STATUS_CONFIG[currentStatus] || ORDER_STATUS_CONFIG.pending_confirmation;
  const isPickup = order.deliveryType === 'customer_pickup';
  const orderIdShort = order.orderNumber || order._id?.slice(-6).toUpperCase();

  const customerName =
    order.customerId?.name ||
    order.deliveryAddressSnapshot?.fullName ||
    order.deliveryAddress?.fullName ||
    'Customer';
  const customerPhone =
    order.customerId?.phone ||
    order.deliveryAddressSnapshot?.phone ||
    order.deliveryAddress?.phone ||
    '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#27352F]">
                Order #{orderIdShort}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-[#737B76] flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Placed on {formatDateTime(order.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons in Header for easy access */}
        <div className="flex items-center gap-2">
          {currentStatus === ORDER_STATUS.PENDING_CONFIRMATION && (
            <>
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Reject Order
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Order</span>
              </button>
            </>
          )}

          {currentStatus === ORDER_STATUS.ACCEPTED && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(ORDER_STATUS.PREPARING)}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-[#F6A23A]" />
              <span>Start Preparing</span>
            </button>
          )}

          {currentStatus === ORDER_STATUS.PREPARING && (
            <button
              type="button"
              onClick={() =>
                handleUpdateStatus(
                  isPickup
                    ? ORDER_STATUS.READY_FOR_PICKUP
                    : ORDER_STATUS.OUT_FOR_DELIVERY
                )
              }
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-[#F6A23A] hover:bg-[#E08F2A] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Bike className="w-4 h-4" />
              <span>{isPickup ? 'Mark Ready for Pickup' : 'Dispatch for Delivery'}</span>
            </button>
          )}

          {(currentStatus === ORDER_STATUS.OUT_FOR_DELIVERY ||
            currentStatus === ORDER_STATUS.READY_FOR_PICKUP) && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(ORDER_STATUS.DELIVERED)}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Delivered</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <h3 className="text-xs font-bold text-[#737B76] uppercase tracking-wider mb-2">
          Order Status Lifecycle
        </h3>
        <OrderStatusStepper
          status={currentStatus}
          deliveryType={order.deliveryType}
        />
      </div>

      {/* Grid: Ordered Items + Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Items (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#27352F] uppercase tracking-wider">
              Dishes &amp; Portions Ordered
            </h3>

            <div className="divide-y divide-[#E8ECE7]">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#14513F]/10 text-[#14513F] font-bold text-xs flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-bold text-[#27352F]">
                        {item.foodName || item.name || item.foodId?.name || 'Dish'}
                      </p>
                      <p className="text-xs text-[#737B76]">
                        {formatCurrency(item.unitPrice || item.price || 0)} each
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#14513F]">
                    {formatCurrency((item.unitPrice || item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer Cooking Instructions:</span>
                </div>
                <p className="leading-relaxed">{order.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#27352F] uppercase tracking-wider">
              Financial Breakdown
            </h3>
            <div className="space-y-2 text-xs text-[#737B76]">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#27352F]">
                  {formatCurrency(order.subtotal || order.totalAmount)}
                </span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex items-center justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-[#27352F]">
                    {formatCurrency(order.deliveryFee)}
                  </span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -{formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8ECE7] flex items-center justify-between text-sm font-extrabold text-[#14513F]">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount ?? order.total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs font-bold text-[#27352F]">
                <CreditCard className="w-3.5 h-3.5 text-[#14513F]" />
                <span className="capitalize">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery (Collect from customer)'
                    : 'Prepaid Online via Razorpay'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Details (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#27352F] uppercase tracking-wider">
              Customer &amp; Delivery
            </h3>

            {/* Customer Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#27352F]">
                <User className="w-4 h-4 text-[#14513F] shrink-0" />
                <span className="font-bold">{customerName}</span>
              </div>

              {customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#14513F] shrink-0" />
                  <a
                    href={`tel:${customerPhone}`}
                    className="font-bold text-[#14513F] hover:underline"
                  >
                    {formatPhone(customerPhone)}
                  </a>
                </div>
              )}
            </div>

            {/* Delivery Mode */}
            <div className="pt-3 border-t border-[#E8ECE7]">
              <span className="text-xs font-bold text-[#737B76] uppercase tracking-wider block mb-2">
                Fulfillment Type
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#27352F]">
                {isPickup ? (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#F6A23A]" />
                    <span>Customer Will Pick Up from Kitchen</span>
                  </>
                ) : (
                  <>
                    <Bike className="w-4 h-4 text-[#14513F]" />
                    <span>Kitchen Delivery to Customer Address</span>
                  </>
                )}
              </div>
            </div>

            {/* Address */}
            {!isPickup && (order.deliveryAddressSnapshot || order.deliveryAddress) && (
              <div className="pt-3 border-t border-[#E8ECE7] text-xs space-y-1">
                <span className="font-bold text-[#737B76] uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <p className="font-semibold text-[#27352F]">
                  {order.deliveryAddressSnapshot?.addressLine || order.deliveryAddress?.street || ''}
                </p>
                <p className="text-[#737B76]">
                  {order.deliveryAddressSnapshot?.city || order.deliveryAddress?.city}, {order.deliveryAddressSnapshot?.pincode || order.deliveryAddress?.pincode}
                </p>
                {(order.deliveryAddressSnapshot?.landmark || order.deliveryAddress?.landmark) && (
                  <p className="text-[#737B76]">
                    Landmark: {order.deliveryAddressSnapshot?.landmark || order.deliveryAddress?.landmark}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title="Reject Customer Order"
        description="Please select a clear reason for rejecting this order so the customer is properly notified."
        confirmLabel="Reject Order"
        isDanger={true}
        requireReason={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default ChefOrderDetailPage;
