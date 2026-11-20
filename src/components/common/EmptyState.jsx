import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = UtensilsCrossed,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E8ECE7] shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center justify-center mb-4 text-[#14513F]">
        <Icon className="w-8 h-8 text-[#14513F]/80" />
      </div>
      <h3 className="text-lg font-bold text-[#27352F] mb-1.5">{title}</h3>
      <p className="text-sm text-[#737B76] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-semibold hover:bg-[#0E3B2E] transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] text-sm font-semibold hover:bg-white transition cursor-pointer active:scale-95"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
