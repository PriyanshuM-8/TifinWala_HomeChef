// GharKaSwad HomeChef Brand Colors & System Constants

export const BRAND_COLORS = {
  primary: '#14513F',
  primaryDark: '#0E3B2E',
  primaryLight: '#1C6B54',
  orange: '#F6A23A',
  orangeHover: '#E08F2A',
  cream: '#FFFDF8',
  dark: '#27352F',
  secondary: '#737B76',
  light: '#F7F8F5',
  border: '#E8ECE7',
};

// Order Status Definitions & Badge Styles
export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'pending_confirmation',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_CONFIG = {
  pending_confirmation: {
    label: 'New Order',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Awaiting your acceptance',
  },
  accepted: {
    label: 'Accepted',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Accepted by kitchen',
  },
  preparing: {
    label: 'Preparing Food',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Meal is being cooked',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Ready for customer pickup',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'On the way to customer',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Successfully delivered',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Order rejected by kitchen',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Order cancelled',
  },
};

// Subscription Meal Statuses
export const SUBSCRIPTION_MEAL_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
};

export const SUBSCRIPTION_MEAL_CONFIG = {
  scheduled: {
    label: 'Scheduled',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  preparing: {
    label: 'Preparing',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  skipped: {
    label: 'Skipped by User',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const APPROVAL_STATUS_CONFIG = {
  pending: {
    label: 'Verification Pending',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    message: 'Your kitchen profile is under review by the GharKaSwad Quality & Safety team. You will be able to receive customer orders once approved.',
  },
  approved: {
    label: 'Verified Partner Kitchen',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    message: 'Your kitchen is verified and active to accept orders.',
  },
  rejected: {
    label: 'Review Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    message: 'Your kitchen verification was rejected. Please review your kitchen and food safety details and submit updates.',
  },
};

// Wallet constants
export const COMMISSION_MINIMUM_BALANCE_RUPEES = 50; // ₹50 floor required for COD acceptance

// Food Types
export const FOOD_TYPES = [
  { value: 'veg', label: 'Vegetarian', badgeClass: 'border-emerald-600 text-emerald-700' },
  { value: 'non_veg', label: 'Non-Vegetarian', badgeClass: 'border-rose-600 text-rose-700' },
  { value: 'jain', label: 'Jain Friendly', badgeClass: 'border-amber-600 text-amber-700' },
  { value: 'vegan', label: 'Vegan', badgeClass: 'border-teal-600 text-teal-700' },
];

// Common Rejection Reasons for Orders
export const ORDER_REJECTION_REASONS = [
  'Items / ingredients currently out of stock',
  'Kitchen at maximum capacity',
  'Operating hours ended for today',
  'Cannot fulfill special dietary requirements',
  'Kitchen emergency or power outage',
  'Other (specify below)',
];
