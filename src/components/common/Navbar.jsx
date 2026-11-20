import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrderAlert } from '../../context/OrderAlertContext';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socket';
import {
  UtensilsCrossed,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronDown,
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
} from 'lucide-react';
import { APPROVAL_STATUS_CONFIG } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

export const Navbar = () => {
  const { user, chefProfile, approvalStatus, refreshProfile, logout } = useAuth();
  const { soundEnabled, toggleSound } = useOrderAlert();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const kitchenName = chefProfile?.kitchenName || user?.name || 'My Kitchen';
  const statusConfig = APPROVAL_STATUS_CONFIG[approvalStatus] || APPROVAL_STATUS_CONFIG.pending;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Fetch in-app notifications
  const loadNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await notificationService.getNotifications({ limit: 6 });
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }, [user?._id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen to socket events to refresh notifications
  useEffect(() => {
    if (!user?._id) return;
    const unsubNewOrder = socketService.onNewOrder(() => {
      loadNotifications();
    });
    const unsubStatus = socketService.onOrderStatusUpdated(() => {
      loadNotifications();
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
    };
  }, [user?._id, loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setNotifDropdownOpen(false);
      if (notif.metadata?.orderId) {
        navigate(`/orders/${notif.metadata.orderId}`);
      }
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#E8ECE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Kitchen Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#14513F] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0E3B2E] transition">
                <UtensilsCrossed className="w-5 h-5 text-[#F6A23A]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-[#14513F]">
                    GharKa<span className="text-[#F6A23A]">Swad</span>
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#14513F]/10 text-[#14513F] uppercase">
                    Chef
                  </span>
                </div>
                <span className="text-xs text-[#737B76] font-medium truncate max-w-[140px] sm:max-w-[200px]">
                  {kitchenName}
                </span>
              </div>
            </Link>

            {/* Approval Badge (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center ml-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}
              >
                {approvalStatus === 'approved' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : approvalStatus === 'rejected' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                )}
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Ringtone Status Button */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Order sound alert active (Click to mute)' : 'Order sound muted (Click to enable ringtone)'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  <span className="hidden md:inline">Ringtone On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden md:inline">Muted</span>
                </>
              )}
            </button>

            {/* In-App Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-[#737B76] hover:text-[#14513F] hover:bg-[#F7F8F5] border border-transparent hover:border-[#E8ECE7] transition cursor-pointer relative"
                aria-label="Kitchen notifications"
                title="Order alerts and updates"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8ECE7] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8ECE7] px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#27352F]">Kitchen Alerts</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#14513F] hover:underline inline-flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#E8ECE7]/60 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#737B76]">
                          No notifications. Real-time customer orders will appear here.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                              !notif.isRead
                                ? 'bg-[#14513F]/5 hover:bg-[#14513F]/10'
                                : 'hover:bg-[#F7F8F5]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-[#27352F] leading-tight">
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#14513F] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#737B76] mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-[#737B76]/80 mt-1 block">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Refresh Status Button */}
            <button
              onClick={handleRefresh}
              title="Refresh Kitchen Data"
              className="p-2 rounded-xl text-[#737B76] hover:text-[#14513F] hover:bg-[#F7F8F5] border border-transparent hover:border-[#E8ECE7] transition cursor-pointer active:scale-95"
              aria-label="Refresh kitchen data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#14513F]' : ''}`} />
            </button>

            {/* Status Pill on Mobile */}
            <div className="sm:hidden flex items-center">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.badgeClass}`}
              >
                {approvalStatus === 'approved' ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ) : approvalStatus === 'rejected' ? (
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-600" />
                )}
                <span className="truncate max-w-[70px]">
                  {approvalStatus === 'approved' ? 'Verified' : approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </span>
            </div>

            {/* Chef Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-[#E8ECE7] hover:border-[#14513F]/30 hover:bg-[#F7F8F5] transition cursor-pointer"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-[#14513F] text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name ? user.name.charAt(0) : 'C'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#27352F] line-clamp-1 max-w-[100px]">
                    {user?.name || 'Chef'}
                  </span>
                  <span className="text-[10px] text-[#737B76]">Partner</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#737B76] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8ECE7] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-[#E8ECE7] mb-1">
                      <p className="text-xs font-bold text-[#27352F] truncate">
                        {kitchenName}
                      </p>
                      <p className="text-[11px] text-[#737B76] truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#27352F] hover:bg-[#F7F8F5] rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-[#14513F]" />
                      <span>Kitchen Profile & Location</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
