// Design System Tokens
// Unified 4-Color Button System for ALL pages
// Teal (Primary), Blue (Secondary), Green (Success), Red (Danger)

export const buttonStyles = {
  // PRIMARY (TEAL) - Use for ALL main actions across the app
  // Submit, Save, Create, Apply, Post, Send, Get Started, etc.
  primary: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  
  // SECONDARY (BLUE) - Use for secondary/alternative actions
  // View Details, Learn More, Back, Cancel (non-destructive), Info, etc.
  secondary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  
  // SUCCESS (GREEN) - Use for positive/approval actions
  // Approve, Accept, Confirm, Complete, Verify, etc.
  success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  
  // DANGER (RED) - ONLY for destructive actions
  // Delete, Remove, Reject, Cancel (destructive), etc.
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  
  // OUTLINE variants
  outline: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 active:bg-teal-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  outlineSecondary: 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  outlineSuccess: 'border-2 border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  outlineDanger: 'border-2 border-red-600 text-red-700 hover:bg-red-50 active:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  
  // GHOST variants - Minimal styling, tertiary actions
  ghost: 'text-teal-600 hover:bg-teal-50 active:bg-teal-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  ghostSecondary: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  ghostGray: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Small button variants
  primarySmall: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  secondarySmall: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  successSmall: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  dangerSmall: 'bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  outlineSmall: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Large button variants
  primaryLarge: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md',
  secondaryLarge: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md',
  successLarge: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md',
  outlineLarge: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
};

export const inputStyles = {
  default: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors',
  error: 'w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
  small: 'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
};

export const cardStyles = {
  default: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  hover: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer',
  noPadding: 'bg-white rounded-lg shadow-sm border border-gray-200',
};

export const badgeStyles = {
  // TEAL - Primary status (Active, Verified, Primary)
  primary: 'px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium',
  
  // GREEN - Success status (Success, Approved, Completed)
  success: 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium',
  
  // BLUE - Info/Secondary status (In Progress, New, Info)
  secondary: 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium',
  
  // YELLOW - Warning/Pending (Pending, Under Review, Waiting)
  warning: 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium',
  
  // RED - Danger/Negative (Rejected, Failed, Inactive, Cancelled)
  danger: 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium',
  
  // GRAY - Neutral (Inactive, Draft, Archived)
  gray: 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium',
  
  // Small badge variants
  primarySmall: 'px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium',
  successSmall: 'px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium',
  secondarySmall: 'px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium',
  warningSmall: 'px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium',
  dangerSmall: 'px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium',
};

export const linkStyles = {
  primary: 'text-teal-600 hover:text-teal-700 font-medium transition-colors',
  secondary: 'text-blue-600 hover:text-blue-700 font-medium transition-colors',
  danger: 'text-red-600 hover:text-red-700 font-medium transition-colors',
  underline: 'text-teal-600 hover:text-teal-700 underline font-medium transition-colors',
};

export const gradientStyles = {
  primary: 'bg-gradient-to-r from-teal-600 to-blue-600',
  primaryLight: 'bg-gradient-to-br from-teal-50 to-blue-50',
  hero: 'bg-gradient-to-br from-teal-50 via-blue-50 to-teal-50',
};

export const statusColors = {
  // Use TEAL for primary/active states
  active: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  verified: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  
  // Use GREEN for positive/success states
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  
  // Use BLUE for info/in-progress states
  inProgress: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  
  // Use YELLOW for pending/warning states
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  review: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  
  // Use RED for negative/rejected states
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  
  // Use GRAY for neutral/inactive states
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};

// Icon colors for consistency - 4-color system
export const iconColors = {
  primary: 'text-teal-600',      // Main icons
  success: 'text-green-600',     // Success/approval icons
  secondary: 'text-blue-600',    // Info/secondary icons
  danger: 'text-red-600',        // Danger/delete icons
  warning: 'text-yellow-600',    // Warning icons
  gray: 'text-gray-600',         // Neutral icons
};

// Utility function to combine classes
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
