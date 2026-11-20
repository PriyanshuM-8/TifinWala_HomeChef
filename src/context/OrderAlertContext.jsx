import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import socketService from '../services/socket';
import soundService from '../services/soundService';
import orderService from '../services/orderService';
import { extractErrorMessage } from '../services/api';

const OrderAlertContext = createContext(null);

export const OrderAlertProvider = ({ children }) => {
  const { user, chefProfile } = useAuth();
  const { addToast } = useToast();

  const chefUserId = user?._id || user?.id;
  const chefProfileId = chefProfile?._id || chefProfile?.id;

  const [incomingOrder, setIncomingOrder] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('gharkaswad_chef_sound_enabled') !== 'false';
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Keep a ref to the current incoming order to prevent duplicate alerts
  const incomingOrderRef = useRef(null);
  incomingOrderRef.current = incomingOrder;

  // Sync user room when chef logs in
  useEffect(() => {
    if (chefUserId) {
      socketService.joinChefUser(chefUserId, chefProfileId);
    } else {
      socketService.disconnect();
      soundService.stopOrderRingtone();
      setIncomingOrder(null);
    }
  }, [chefUserId, chefProfileId]);

  // Request browser notification permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  /**
   * Unlock Audio & Enable Sound Alerts
   */
  const enableSound = useCallback(async () => {
    await soundService.unlockAudio();
    soundService.playSingleChime();
    setSoundEnabled(true);
    localStorage.setItem('gharkaswad_chef_sound_enabled', 'true');
    addToast('Order ringtone alerts enabled!', 'success');

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [addToast]);

  const toggleSound = useCallback(async () => {
    if (!soundEnabled) {
      await enableSound();
    } else {
      soundService.stopOrderRingtone();
      setSoundEnabled(false);
      localStorage.setItem('gharkaswad_chef_sound_enabled', 'false');
      addToast('Order sound muted.', 'info');
    }
  }, [soundEnabled, enableSound, addToast]);

  /**
   * Dismiss the incoming order alert modal without accepting/rejecting
   */
  const dismissAlert = useCallback(() => {
    soundService.stopOrderRingtone();
    setIncomingOrder(null);
  }, []);

  /**
   * Chef Accepts Incoming Order
   */
  const acceptOrder = useCallback(
    async (orderId) => {
      setIsProcessingAction(true);
      try {
        const res = await orderService.acceptOrder(orderId);
        soundService.stopOrderRingtone();
        setIncomingOrder(null);
        addToast(res.message || 'Order accepted! Kitchen preparation started.', 'success');
        window.dispatchEvent(new CustomEvent('gharkaswad:orders-updated'));
        return { success: true };
      } catch (err) {
        soundService.stopOrderRingtone();
        const msg = extractErrorMessage(err, 'Failed to accept order.');
        addToast(msg, 'error');
        return { success: false, message: msg };
      } finally {
        setIsProcessingAction(false);
      }
    },
    [addToast]
  );

  /**
   * Chef Rejects Incoming Order
   */
  const rejectOrder = useCallback(
    async (orderId, rejectionReason) => {
      setIsProcessingAction(true);
      try {
        const res = await orderService.rejectOrder(orderId, rejectionReason);
        soundService.stopOrderRingtone();
        setIncomingOrder(null);
        addToast(res.message || 'Order declined. Customer notified.', 'info');
        window.dispatchEvent(new CustomEvent('gharkaswad:orders-updated'));
        return { success: true };
      } catch (err) {
        soundService.stopOrderRingtone();
        const msg = extractErrorMessage(err, 'Failed to reject order.');
        addToast(msg, 'error');
        return { success: false, message: msg };
      } finally {
        setIsProcessingAction(false);
      }
    },
    [addToast]
  );

  /**
   * Listen for Socket.IO New Order Events & Status Updates
   */
  useEffect(() => {
    if (!chefUserId) return;

    // 1. New Order event arrived
    const unsubNewOrder = socketService.onNewOrder((orderData) => {
      if (!orderData) return;

      const targetId = orderData.orderId || orderData._id;

      // Ignore if this order is already actively ringing on screen
      if (incomingOrderRef.current && (incomingOrderRef.current.orderId || incomingOrderRef.current._id) === targetId) {
        return;
      }

      setIncomingOrder(orderData);

      // Trigger ringing alert if sound is enabled
      if (soundEnabled) {
        soundService.startOrderRingtone();
      }

      // Show system background notification
      soundService.showSystemNotification(orderData);

      // Dispatch event for other components (Dashboard / Order Lists) to refresh
      window.dispatchEvent(new CustomEvent('gharkaswad:orders-updated'));
    });

    // 2. Order status updated by customer or system (e.g. cancelled)
    const unsubStatus = socketService.onOrderStatusUpdated((data) => {
      if (!data) return;

      const targetId = data.orderId || data._id;
      if (incomingOrderRef.current && (incomingOrderRef.current.orderId || incomingOrderRef.current._id) === targetId) {
        // Order was cancelled, resolved or modified
        soundService.stopOrderRingtone();
        setIncomingOrder(null);
        addToast(`Order #${data.orderNumber || ''} update: ${data.title || data.message || data.status}`, 'info');
      }

      window.dispatchEvent(new CustomEvent('gharkaswad:orders-updated'));
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
      soundService.stopOrderRingtone();
    };
  }, [chefUserId, soundEnabled, addToast]);

  return (
    <OrderAlertContext.Provider
      value={{
        incomingOrder,
        soundEnabled,
        enableSound,
        toggleSound,
        dismissAlert,
        acceptOrder,
        rejectOrder,
        isProcessingAction,
      }}
    >
      {children}
    </OrderAlertContext.Provider>
  );
};

export const useOrderAlert = () => {
  const context = useContext(OrderAlertContext);
  if (!context) {
    throw new Error('useOrderAlert must be used within an OrderAlertProvider');
  }
  return context;
};

export default OrderAlertContext;
