import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, Trash2, Clock, Users } from 'lucide-react';
import { FOOD_TYPES } from '../../utils/constants';

export const FoodCard = ({
  food,
  onEdit,
  onDelete,
  onToggleAvailability,
  isToggling = false,
}) => {
  const foodTypeConfig =
    FOOD_TYPES.find((t) => t.value === food.foodType) || FOOD_TYPES[0];

  const imageUrl = food.imageUrl || food.image?.url || '/panirthali.png';

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECE7] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image & Quick Badges */}
        <div className="relative h-44 sm:h-48 w-full bg-[#F7F8F5] overflow-hidden">
          <img
            src={imageUrl}
            alt={food.name}
            onError={(e) => {
              e.target.src = '/panirthali.png';
            }}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* Food Type Badge (Veg/Non-Veg) */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#E8ECE7] flex items-center gap-1.5 shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                food.foodType === 'non_veg' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            />
            <span className="text-[11px] font-bold text-[#27352F] capitalize">
              {foodTypeConfig.label}
            </span>
          </div>

          {/* Availability Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${
                food.isAvailable
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {food.isAvailable ? 'In Stock' : 'Sold Out'}
            </span>
          </div>

          {/* Category tag */}
          {food.categoryName && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {food.categoryName}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-base text-[#27352F] line-clamp-1">
              {food.name}
            </h4>
            <span className="font-extrabold text-base text-[#14513F] shrink-0">
              {formatCurrency(food.price)}
            </span>
          </div>

          <p className="text-xs text-[#737B76] line-clamp-2 mb-3 leading-relaxed">
            {food.description || 'Delicious home-cooked delicacy.'}
          </p>

          {/* Metas: Serving & Prep Time */}
          <div className="flex items-center gap-4 text-xs text-[#737B76] pt-2 border-t border-[#E8ECE7]/80">
            {food.preparationTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F6A23A]" />
                <span>{food.preparationTime} mins</span>
              </div>
            )}
            {food.servingSize && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#14513F]" />
                <span>{food.servingSize}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3.5 sm:px-5 sm:py-3 bg-[#F7F8F5]/80 border-t border-[#E8ECE7] flex items-center justify-between gap-2">
        {/* Quick Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={!!food.isAvailable}
              onChange={() => onToggleAvailability(food._id, !food.isAvailable)}
              disabled={isToggling}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#14513F]"></div>
          </div>
          <span className="text-xs font-semibold text-[#27352F]">
            {food.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </label>

        {/* Edit and Delete Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(food)}
            className="p-2 rounded-xl text-[#27352F] hover:bg-white border border-transparent hover:border-[#E8ECE7] transition shadow-xs cursor-pointer active:scale-95"
            title="Edit Dish"
          >
            <Edit2 className="w-4 h-4 text-[#14513F]" />
          </button>
          <button
            onClick={() => onDelete(food)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition shadow-xs cursor-pointer active:scale-95"
            title="Delete Dish"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
