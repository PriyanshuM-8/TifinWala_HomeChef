import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import orderService from '../../services/orderService';
import { extractErrorMessage } from '../../services/api';
import OrderCard from '../../components/order/OrderCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  Bike,
  Flame,
} from 'lucide-react';
import { ORDER_STATUS } from '../../utils/constants';

export const ChefOrdersPage = () => {
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Action states
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderService.getOrders({ limit: 50 });
      const orderList = res?.orders || res?.data || [];
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const handleOrdersUpdated = () => {
      fetchOrders();
    };

    window.addEventListener('gharkaswad:orders-updated', handleOrdersUpdated);
    const interval = setInterval(fetchOrders, 20000); // 20s live polling

    return () => {
      window.removeEventListener('gharkaswad:orders-updated', handleOrdersUpdated);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  // Transitions
  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.acceptOrder(orderId);
      addToast('Order accepted! Please begin cooking on schedule.', 'success');
      fetchOrders();
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
      fetchOrders();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to reject order.'), 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setProcessingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, status);
      addToast(`Order updated to ${status.replace(/_/g, ' ')}!`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(extractErrorMessage(err, 'Failed to update order status.'), 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Filter tabs
  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending_confirmation', label: 'New Requests' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'preparing', label: 'In Kitchen' },
    { id: 'dispatch', label: 'Out / Ready' },
    { id: 'delivered', label: 'Completed' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = order.orderStatus || order.status;

      // Tab filter
      if (statusFilter === 'pending_confirmation' && currentStatus !== ORDER_STATUS.PENDING_CONFIRMATION) return false;
      if (statusFilter === 'accepted' && currentStatus !== ORDER_STATUS.ACCEPTED) return false;
      if (statusFilter === 'preparing' && currentStatus !== ORDER_STATUS.PREPARING) return false;
      if (
        statusFilter === 'dispatch' &&
        currentStatus !== ORDER_STATUS.OUT_FOR_DELIVERY &&
        currentStatus !== ORDER_STATUS.READY_FOR_PICKUP
      )
        return false;
      if (statusFilter === 'delivered' && currentStatus !== ORDER_STATUS.DELIVERED) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderIdMatch = order._id?.toLowerCase().includes(query) || order.orderNumber?.toLowerCase().includes(query);
        const customerNameMatch =
          order.customerId?.name?.toLowerCase().includes(query) ||
          order.deliveryAddressSnapshot?.fullName?.toLowerCase().includes(query) ||
          order.deliveryAddress?.fullName?.toLowerCase().includes(query);
        const itemMatch = order.items?.some((i) =>
          (i.foodName || i.name || i.foodId?.name || '').toLowerCase().includes(query)
        );
        if (!orderIdMatch && !customerNameMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Loading customer orders..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8ECE7] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#27352F] tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#737B76] mt-0.5">
            Accept incoming orders, update cooking milestones, and track deliveries.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] hover:border-[#14513F]/30 text-[#27352F] text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#14513F]' : ''}`} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8ECE7] shadow-xs space-y-3">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const count =
              tab.id === 'all'
                ? orders.length
                : tab.id === 'dispatch'
                ? orders.filter(
                    (o) =>
                      (o.orderStatus || o.status) === ORDER_STATUS.OUT_FOR_DELIVERY ||
                      (o.orderStatus || o.status) === ORDER_STATUS.READY_FOR_PICKUP
                  ).length
                : orders.filter((o) => (o.orderStatus || o.status) === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#14513F] text-white shadow-xs'
                    : 'bg-[#F7F8F5] text-[#27352F] hover:bg-white border border-[#E8ECE7]'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      statusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E8ECE7] text-[#27352F]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737B76]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer name, or dish name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs sm:text-sm text-[#27352F] focus:outline-none focus:border-[#14513F] transition"
          />
        </div>
      </div>

      {/* Orders Grid / List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={
            statusFilter === 'all' && !searchQuery
              ? 'Your kitchen currently has no customer orders.'
              : 'No orders match your active filter criteria.'
          }
          actionLabel={statusFilter !== 'all' || searchQuery ? 'Reset Filters' : undefined}
          onAction={() => {
            setStatusFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredOrders.map((order) => (
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

      {/* Reject Order Modal */}
      <ConfirmModal
        isOpen={!!rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        onConfirm={handleConfirmReject}
        title="Reject Customer Order"
        description="Please provide a clear reason for rejecting this order so the customer is properly notified."
        confirmLabel="Reject Order"
        isDanger={true}
        requireReason={true}
        isLoading={!!processingOrderId}
      />
    </div>
  );
};

export default ChefOrdersPage;
