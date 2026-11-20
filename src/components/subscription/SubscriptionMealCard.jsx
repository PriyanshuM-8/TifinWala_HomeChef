import React from 'react';
import { formatDate } from '../../utils/formatters';
import { SUBSCRIPTION_MEAL_CONFIG } from '../../utils/constants';
import {
  Calendar,
  User,
  MapPin,
  Utensils,
  CheckCircle,
  Bike,
  Flame,
} from 'lucide-react';

export const SubscriptionMealCard = ({
  meal,
  onAccept,
  onReject,
  onUpdateStatus,
  isProcessing = false,
}) => {
  const statusConfig =
    SUBSCRIPTION_MEAL_CONFIG[meal.status] || SUBSCRIPTION_MEAL_CONFIG.scheduled;

  const mealDate = meal.scheduledDate || meal.dateKey || meal.date;
  const customerName = meal.customerId?.name || meal.customerName || 'Subscriber';
  const customerAddress =
    meal.deliveryAddress?.street ||
    meal.deliveryAddress?.city ||
    meal.address ||
    'Standard address';

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8ECE7] flex items-center justify-between gap-2 bg-[#F7F8F5]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6A23A]/15 text-[#F6A23A] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-[#14513F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#27352F]">
                  {formatDate(mealDate)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#F6A23A] capitalize">
                {meal.mealType || 'Lunch'} Meal
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#14513F]/10 text-[#14513F]">
              Daily Subscription
            </span>
          </div>
        </div>

        {/* Content info */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Customer info */}
          <div className="text-xs text-[#27352F] space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#14513F]" />
              <span className="font-semibold">{customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-[#737B76]">
              <MapPin className="w-3.5 h-3.5 text-[#737B76] shrink-0" />
              <span className="truncate">{customerAddress}</span>
            </div>
          </div>

          {/* Meal Dishes */}
          <div className="p-3 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14513F] mb-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#F6A23A]" />
              <span>Assigned Meal Package:</span>
            </div>
            <div className="text-xs font-medium text-[#27352F]">
              {meal.foodId?.name || meal.mealName || meal.description || 'Custom Chef Thali (Dal, Sabzi, Roti, Rice)'}
            </div>
            {meal.quantity && (
              <p className="text-[11px] text-[#737B76] mt-1 font-semibold">
                Quantity: {meal.quantity} meal{meal.quantity > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 sm:px-5 sm:py-3 bg-[#F7F8F5]/80 border-t border-[#E8ECE7] flex items-center justify-between gap-2">
        <span className="text-xs text-[#737B76]">
          Status:{' '}
          <span className="font-bold text-[#27352F] capitalize">
            {meal.status}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {meal.status === 'scheduled' && onAccept && (
            <>
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(meal._id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>
              )}
              <button
                type="button"
                onClick={() => onAccept(meal._id)}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </button>
            </>
          )}

          {meal.status === 'confirmed' && onUpdateStatus && (
            <button
              type="button"
              onClick={() => onUpdateStatus(meal._id, 'preparing')}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#F6A23A]" />
              <span>Start Cooking</span>
            </button>
          )}

          {meal.status === 'preparing' && onUpdateStatus && (
            <button
              type="button"
              onClick={() => onUpdateStatus(meal._id, 'out_for_delivery')}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-[#F6A23A] hover:bg-[#E08F2A] text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Out for Delivery</span>
            </button>
          )}

          {meal.status === 'out_for_delivery' && onUpdateStatus && (
            <button
              type="button"
              onClick={() => onUpdateStatus(meal._id, 'delivered')}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Delivered</span>
            </button>
          )}

          {meal.status === 'delivered' && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Delivered</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionMealCard;
