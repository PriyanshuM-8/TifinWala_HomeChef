import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import subscriptionService from '../../services/subscriptionService';
import { extractErrorMessage } from '../../services/api';
import SubscriptionMealCard from '../../components/subscription/SubscriptionMealCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarDays,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { SUBSCRIPTION_MEAL_STATUS } from '../../utils/constants';

export const ChefSubscriptionsPage = () => {
  const { addToast } = useToast();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [mealTypeFilter, setMealTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Action
  const [rejectModalMeal, setRejectModalMeal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      const res = await subscriptionService.getMeals({ limit: 50 });
      const mealList = res?.meals || res?.data || [];
      setMeals(mealList);
    } catch (err) {
      console.error('Failed to load subscription meals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Actions
  const handleAcceptMeal = async (mealId) => {
    setIsProcessing(true);
    try {
      await subscriptionService.acceptMeal(mealId);
      addToast('Subscription meal confirmed!', 'success');
      fetchMeals();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to confirm meal.'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectModalMeal) return;
    setIsProcessing(true);
    try {
      await subscriptionService.rejectMeal(rejectModalMeal, reason);
      addToast('Subscription meal rejected.', 'info');
      setRejectModalMeal(null);
      fetchMeals();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to reject meal.'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (mealId, status) => {
    setIsProcessing(true);
    try {
      await subscriptionService.updateMealStatus(mealId, status);
      addToast(`Meal updated to ${status}!`, 'success');
      fetchMeals();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update status.'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (statusFilter !== 'all' && meal.status !== statusFilter) return false;
      if (mealTypeFilter !== 'all' && meal.mealType !== mealTypeFilter) return false;
      if (dateFilter) {
        const mealDateStr = (meal.scheduledDate || meal.dateKey || '').slice(0, 10);
        if (mealDateStr !== dateFilter) return false;
      }
      return true;
    });
  }, [meals, statusFilter, mealTypeFilter, dateFilter]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading subscription meal calendar..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
            Subscription Meal Schedule
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Prepare regular homestyle meals for subscribers on automated schedules.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchMeals();
          }}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] hover:border-[#14513F]/30 text-[#27352F] text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
          <span>Sync Schedule</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8ECE7] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            >
              <option value="all">All Meal Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Meal Type Filter */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
              Meal Type
            </label>
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            >
              <option value="all">All Meal Types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Specific Date Filter */}
          <div>
            <label className="block text-xs font-bold text-[#27352F] uppercase tracking-wider mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
            />
          </div>
        </div>

        {/* Clear active filter */}
        {(statusFilter !== 'all' || mealTypeFilter !== 'all' || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-[#737B76] pt-2 border-t border-[#E8ECE7]">
            <span>
              Showing {filteredMeals.length} of {meals.length} meals
            </span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setMealTypeFilter('all');
                setDateFilter('');
              }}
              className="text-[#14513F] font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of Subscription Meals */}
      {filteredMeals.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No subscription meals found"
          description={
            meals.length === 0
              ? 'There are currently no active meal subscriptions assigned to your kitchen.'
              : 'No meals match your active filters.'
          }
          actionLabel={statusFilter !== 'all' || mealTypeFilter !== 'all' || dateFilter ? 'Reset Filters' : undefined}
          onAction={() => {
            setStatusFilter('all');
            setMealTypeFilter('all');
            setDateFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMeals.map((meal) => (
            <SubscriptionMealCard
              key={meal._id}
              meal={meal}
              onAccept={handleAcceptMeal}
              onReject={(id) => setRejectModalMeal(id)}
              onUpdateStatus={handleUpdateStatus}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      <ConfirmModal
        isOpen={!!rejectModalMeal}
        onClose={() => setRejectModalMeal(null)}
        onConfirm={handleConfirmReject}
        title="Reject Subscription Meal"
        description="Please provide a clear reason for rejecting this scheduled meal."
        confirmLabel="Reject Meal"
        isDanger={true}
        requireReason={true}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default ChefSubscriptionsPage;
