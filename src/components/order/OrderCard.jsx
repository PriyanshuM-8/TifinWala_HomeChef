import React from 'react';
import { Link } from 'react-router-dom';
import {
  formatCurrency,
  formatDateTime,
  formatPhone,
} from '../../utils/formatters';
import {
  ORDER_STATUS_CONFIG,
  ORDER_STATUS,
} from '../../utils/constants';
import OrderStatusStepper from './OrderStatusStepper';
import {
  Clock,
  Phone,
  User,
  ShoppingBag,
  Bike,
  CheckCircle,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const OrderCard = ({
  order,
  onAccept,
  onReject,
  onUpdateStatus,
  isProcessing = false,
}) => {
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
    <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Order Card Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8ECE7] flex flex-wrap items-center justify-between gap-2 bg-[#F7F8F5]/40">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-8 h-8 rounded-xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center font-bold">
              <ShoppingBag/>
            </div> */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#27352F]">
                  Order #{orderIdShort}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-[#737B76] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formatDateTime(order.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-extrabold text-[#14513F]">
              {formatCurrency(order.totalAmount ?? order.total)}
            </span>
            <div className="text-[10px] font-semibold text-[#737B76] capitalize">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
            </div>
          </div>
        </div>

        {/* Stepper Progression */}
        <div className="px-4 sm:px-5 pt-3 pb-1 border-b border-[#E8ECE7]/60">
          <OrderStatusStepper
            status={currentStatus}
            deliveryType={order.deliveryType}
          />
        </div>

        {/* Customer & Delivery Metas */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#27352F]">
              <User className="w-3.5 h-3.5 text-[#14513F] shrink-0" />
              <span className="font-medium truncate">{customerName}</span>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="text-[#14513F] hover:underline flex items-center gap-1 font-semibold ml-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{formatPhone(customerPhone)}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#737B76]">
              {isPickup ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#F6A23A] shrink-0" />
                  <span className="font-medium text-[#27352F]">Customer Pickup</span>
                </>
              ) : (
                <>
                  <Bike className="w-3.5 h-3.5 text-[#14513F] shrink-0" />
                  <span className="font-medium text-[#27352F] truncate">
                    {order.deliveryAddressSnapshot?.city
                      ? `${order.deliveryAddressSnapshot.addressLine || ''}, ${order.deliveryAddressSnapshot.city}`
                      : order.deliveryAddress?.city
                      ? `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city}`
                      : 'Home Delivery'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ordered Food Items List */}
          <div className="bg-[#F7F8F5] rounded-xl p-3 border border-[#E8ECE7] space-y-1.5">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-bold text-[#14513F] w-5">
                    {item.quantity}x
                  </span>
                  <span className="text-[#27352F] font-medium truncate">
                    {item.foodName || item.name || item.foodId?.name || 'Dish'}
                  </span>
                </div>
                <span className="font-semibold text-[#737B76] shrink-0">
                  {formatCurrency((item.unitPrice || item.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>

          {/* Special Instructions if any */}
          {order.specialInstructions && (
            <div className="text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-bold">Note from customer:</span>{' '}
              {order.specialInstructions}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3.5 sm:px-5 sm:py-3 bg-[#F7F8F5]/80 border-t border-[#E8ECE7] flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] transition"
        >
          <span>Order Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* State Transition Actions */}
        <div className="flex items-center gap-2">
          {currentStatus === ORDER_STATUS.PENDING_CONFIRMATION && (
            <>
              <button
                type="button"
                onClick={() => onReject(order._id)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onAccept(order._id)}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Accept Order</span>
              </button>
            </>
          )}

          {currentStatus === ORDER_STATUS.ACCEPTED && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order._id, ORDER_STATUS.PREPARING)}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#F6A23A]" />
              <span>Start Preparing</span>
            </button>
          )}

          {currentStatus === ORDER_STATUS.PREPARING && (
            <button
              type="button"
              onClick={() =>
                onUpdateStatus(
                  order._id,
                  isPickup
                    ? ORDER_STATUS.READY_FOR_PICKUP
                    : ORDER_STATUS.OUT_FOR_DELIVERY
                )
              }
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-[#F6A23A] hover:bg-[#E08F2A] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>{isPickup ? 'Ready for Pickup' : 'Dispatch for Delivery'}</span>
            </button>
          )}

          {(currentStatus === ORDER_STATUS.OUT_FOR_DELIVERY ||
            currentStatus === ORDER_STATUS.READY_FOR_PICKUP) && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order._id, ORDER_STATUS.DELIVERED)}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Delivered</span>
            </button>
          )}

          {currentStatus === ORDER_STATUS.DELIVERED && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
