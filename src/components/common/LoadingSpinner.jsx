import React from 'react';
import { ChefHat } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading your kitchen...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <div className={`${sizeClasses[size]} border-3 border-[#E8ECE7] border-t-[#14513F] border-r-[#F6A23A] rounded-full animate-spin`} />
        <ChefHat className="w-4 h-4 text-[#14513F] absolute" />
      </div>
      {text && (
        <p className="text-sm font-medium text-[#737B76] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
