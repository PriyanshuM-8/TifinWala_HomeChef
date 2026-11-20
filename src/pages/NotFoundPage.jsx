import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center mb-4">
        <UtensilsCrossed className="w-8 h-8 text-[#F6A23A]" />
      </div>
      <h1 className="text-3xl font-black text-[#27352F] tracking-tight mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-[#737B76] max-w-md mb-6 leading-relaxed">
        The kitchen screen you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-bold hover:bg-[#0E3B2E] transition flex items-center gap-2 shadow-xs cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Kitchen Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
