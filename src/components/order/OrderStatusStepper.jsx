import React from 'react';
import { Check, Clock, Utensils, Bike, CheckCircle2, XCircle } from 'lucide-react';

export const OrderStatusStepper = ({ status, deliveryType = 'chef_delivery' }) => {
  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
        <XCircle className="w-4 h-4 text-rose-600" />
        <span>This order was {status}.</span>
      </div>
    );
  }

  const isPickup = deliveryType === 'customer_pickup';

  const steps = [
    { key: 'pending_confirmation', label: 'Placed', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: Check },
    { key: 'preparing', label: 'Preparing', icon: Utensils },
    {
      key: isPickup ? 'ready_for_pickup' : 'out_for_delivery',
      label: isPickup ? 'Ready' : 'On Way',
      icon: Bike,
    },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'pending_confirmation':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Track Line behind steps */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8ECE7] -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#14513F] -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isDone
                    ? 'bg-[#14513F] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#F6A23A] text-white ring-4 ring-[#F6A23A]/20 scale-110 shadow-xs'
                    : 'bg-white border-2 border-[#E8ECE7] text-[#737B76]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 font-semibold whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#14513F] font-bold'
                    : isDone
                    ? 'text-[#27352F]'
                    : 'text-[#737B76]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusStepper;
