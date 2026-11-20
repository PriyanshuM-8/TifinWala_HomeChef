import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APPROVAL_STATUS_CONFIG } from '../../utils/constants';

export const PendingApprovalBanner = ({ status = 'pending' }) => {
  if (status === 'approved') return null;

  const config = APPROVAL_STATUS_CONFIG[status] || APPROVAL_STATUS_CONFIG.pending;
  const isRejected = status === 'rejected';

  return (
    <div
      className={`mb-6 p-4 rounded-2xl border transition-all shadow-xs ${
        isRejected
          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
          : 'bg-amber-50/90 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isRejected ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isRejected ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide uppercase">
                {config.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/70 border border-current/20">
                Action Required
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 text-[#27352F]/80 leading-relaxed max-w-2xl">
              {config.message}
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs active:scale-95 ${
            isRejected
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          <span>View Kitchen Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PendingApprovalBanner;
