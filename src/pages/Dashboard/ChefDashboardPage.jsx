import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import orderService from '../../services/orderService';
import subscriptionService from '../../services/subscriptionService';
import foodService from '../../services/foodService';
import walletService from '../../services/walletService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  ORDER_STATUS,
  COMMISSION_MINIMUM_BALANCE_RUPEES,
} from '../../utils/constants';
import OrderCard from '../../components/order/OrderCard';
import SubscriptionMealCard from '../../components/subscription/SubscriptionMealCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import RechargeModal from '../../components/wallet/RechargeModal';
import {
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  Wallet,
  Coins,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  RefreshCw,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';

export const ChefDashboardPage = () => {
  const { user, chefProfile, approvalStatus } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [subscriptionMeals, setSubscriptionMeals] = useState([]);
  const [foodSummary, setFoodSummary] = useState({ total: 0, available: 0 });
  const [earningsOverview, setEarningsOverview] = useState(null);
  const [commissionOverview, setCommissionOverview] = useState(null);

  // Modals
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const kitchenName = chefProfile?.kitchenName || user?.name || 'Chef';

  const loadDashboardData = useCallback(async () => {
    try {
      const [ordersRes, mealsRes, foodsRes, earnRes, commRes] =
        await Promise.allSettled([
          orderService.getOrders({ limit: 10 }),
          subscriptionService.getMeals({ limit: 6 }),
          foodService.getFoods({ limit: 100 }),
          walletService.getEarningsOverview(),
          walletService.getCommissionOverview(),
        ]);

      if (ordersRes.status === 'fulfilled') {
        const orderList = ordersRes.value?.orders || ordersRes.value?.data || [];
        setOrders(orderList);
      }

      if (mealsRes.status === 'fulfilled') {
        const meals = mealsRes.value.meals || mealsRes.value.data || [];
        setSubscriptionMeals(meals);
      }

      if (foodsRes.status === 'fulfilled' && foodsRes.value?.foods) {
        const allFoods = foodsRes.value.foods;
        setFoodSummary({
          total: allFoods.length,
          available: allFoods.filter((f) => f.isAvailable).length,
        });
      }

      if (earnRes.status === 'fulfilled' && earnRes.value?.success) {
        setEarningsOverview(earnRes.value);
      }

      if (commRes.status === 'fulfilled' && commRes.value?.success) {
        setCommissionOverview(commRes.value);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleOrdersUpdated = () => {
      loadDashboardData();
    };

    window.addEventListener('gharkaswad:orders-updated', handleOrdersUpdated);
    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      window.removeEventListener('gharkaswad:orders-updated', handleOrdersUpdated);
      clearInterval(interval);
    };
  }, [loadDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Order state transitions
  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.acceptOrder(orderId);
      addToast('Order accepted! Please start preparing on schedule.', 'success');
      loadDashboardData();
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to accept order. Check Commission Wallet balance.',
        'error'
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = (orderId) => {
    setRejectModalOrder(orderId);
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectModalOrder) return;
    setProcessingOrderId(rejectModalOrder);
    try {
      await orderService.rejectOrder(rejectModalOrder, reason);
      addToast('Order rejected.', 'info');
      setRejectModalOrder(null);
      loadDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject order.', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, status);
      addToast(`Order updated to ${status.replace(/_/g, ' ')}!`, 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Subscription meal actions
  const handleUpdateMealStatus = async (mealId, status) => {
    try {
      await subscriptionService.updateMealStatus(mealId, status);
      addToast(`Subscription meal updated to ${status}!`, 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update meal status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading your kitchen dashboard..." />
      </div>
    );
  }

  // Active / new orders
  const pendingOrders = orders.filter(
    (o) => (o.orderStatus || o.status) === ORDER_STATUS.PENDING_CONFIRMATION
  );
  const activeOrders = orders.filter((o) =>
    [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.READY_FOR_PICKUP].includes(
      o.orderStatus || o.status
    )
  );

  const earningsBalance =
    earningsOverview?.data?.balancesRupees?.availableBalance ??
    earningsOverview?.balancesRupees?.availableBalance ??
    earningsOverview?.data?.wallet?.availableBalance ??
    earningsOverview?.wallet?.availableBalance ??
    earningsOverview?.availableBalance ??
    earningsOverview?.data?.availableBalance ??
    0;

  const commissionBalance =
    commissionOverview?.data?.balancesRupees?.availableBalance ??
    commissionOverview?.balancesRupees?.availableBalance ??
    commissionOverview?.data?.commissionWallet?.availableBalance ??
    commissionOverview?.commissionWallet?.availableBalance ??
    0;

  const isCommissionBelowMinimum =
    commissionBalance < COMMISSION_MINIMUM_BALANCE_RUPEES &&
    commissionOverview?.hasUsedFirstOrderFreeBenefit;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Dashboard Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
              Namaste, {kitchenName}!
            </h1>
            <span className="text-lg">👩‍🍳</span>
          </div>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Here is what's cooking in your kitchen today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] hover:border-[#14513F]/30 text-[#27352F] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/foods"
            className="px-4 py-2 rounded-xl bg-[#14513F] hover:bg-[#0E3B2E] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </Link>
        </div>
      </div>

      {/* Urgent Alert Banner: New Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-[#F6A23A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6A23A] text-white flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#27352F]">
                {pendingOrders.length} New Order{pendingOrders.length > 1 ? 's' : ''} Awaiting Acceptance!
              </p>
              <p className="text-xs text-[#737B76]">
                Review the items and customer notes quickly.
              </p>
            </div>
          </div>
          <Link
            to="/orders"
            className="px-4 py-2 rounded-xl bg-[#14513F] text-white text-xs font-bold self-start sm:self-auto hover:bg-[#0E3B2E] transition shadow-xs"
          >
            Review Orders Now
          </Link>
        </div>
      )}

      {/* Low Commission Wallet Notice for COD Acceptance */}
      {isCommissionBelowMinimum && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">
                Low Commission Wallet Balance ({formatCurrency(commissionBalance)})
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                Maintain at least ₹{COMMISSION_MINIMUM_BALANCE_RUPEES} to accept Cash on Delivery (COD) orders without interruption.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRechargeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
          >
            Recharge Wallet
          </button>
        </div>
      )}

      {/* Quick Metrics & Financial Summary Grid (Mobile vertical stack, Desktop 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Earnings Wallet */}
        <Link
          to="/earnings"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs hover:border-[#14513F]/30 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B76]">
              Earnings Wallet
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#14513F]/10 text-[#14513F] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-[#14513F]">
              {formatCurrency(earningsBalance)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-0.5 flex items-center gap-1">
              <span>Available to withdraw</span>
              <ArrowRight className="w-3 h-3 text-[#14513F] group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>

        {/* Metric 2: Commission Wallet */}
        <Link
          to="/commission"
          className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-xs transition group flex flex-col justify-between ${
            isCommissionBelowMinimum
              ? 'border-rose-300 bg-rose-50/20'
              : 'border-[#E8ECE7] hover:border-[#F6A23A]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B76]">
              Commission Wallet
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F6A23A]/15 text-[#F6A23A] flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#14513F]" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-lg sm:text-xl font-black ${
                isCommissionBelowMinimum ? 'text-rose-600' : 'text-[#27352F]'
              }`}
            >
              {formatCurrency(commissionBalance)}
            </p>
            <p className="text-[11px] text-[#737B76] mt-0.5 flex items-center gap-1">
              <span>Platform fee &amp; COD</span>
              <ArrowRight className="w-3 h-3 text-[#F6A23A] group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>

        {/* Metric 3: Active Orders */}
        <Link
          to="/orders"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs hover:border-[#14513F]/30 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B76]">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-[#27352F]">
              {activeOrders.length + pendingOrders.length}
            </p>
            <p className="text-[11px] text-[#737B76] mt-0.5 flex items-center gap-1">
              <span>{pendingOrders.length} new / {activeOrders.length} in kitchen</span>
            </p>
          </div>
        </Link>

        {/* Metric 4: Dishes Available */}
        <Link
          to="/foods"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8ECE7] shadow-xs hover:border-[#14513F]/30 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737B76]">
              Dishes in Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-[#27352F]">
              {foodSummary.available}{' '}
              <span className="text-xs font-normal text-[#737B76]">
                / {foodSummary.total} total
              </span>
            </p>
            <p className="text-[11px] text-[#737B76] mt-0.5 flex items-center gap-1">
              <span>Manage menu stock</span>
              <ArrowRight className="w-3 h-3 text-[#14513F] group-hover:translate-x-1 transition" />
            </p>
          </div>
        </Link>
      </div>

      {/* Section: Priority Orders Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
              Today's Orders Queue
            </h2>
            <p className="text-xs text-[#737B76]">
              Incoming requests and ongoing meal preparation.
            </p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders right now"
            description="Your kitchen is open and ready. New customer orders will appear here in real-time."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.slice(0, 4).map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                onUpdateStatus={handleUpdateOrderStatus}
                isProcessing={processingOrderId === order._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section: Upcoming Subscription Meals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#27352F]">
              Scheduled Subscription Meals
            </h2>
            <p className="text-xs text-[#737B76]">
              Upcoming daily meal commitments for regular customers.
            </p>
          </div>
          <Link
            to="/subscriptions"
            className="text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] flex items-center gap-1"
          >
            <span>View Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subscriptionMeals.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#E8ECE7] text-center text-xs text-[#737B76]">
            No subscription meals scheduled for today. Regular meal packages will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionMeals.slice(0, 3).map((meal) => (
              <SubscriptionMealCard
                key={meal._id}
                meal={meal}
                onUpdateStatus={handleUpdateMealStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <ConfirmModal
        isOpen={!!rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        onConfirm={handleConfirmReject}
        title="Reject Customer Order"
        description="Please select a clear reason for rejecting this order so the customer is properly notified."
        confirmLabel="Reject Order"
        isDanger={true}
        requireReason={true}
        isLoading={!!processingOrderId}
      />

      {/* Commission Recharge Modal */}
      <RechargeModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

export default ChefDashboardPage;
