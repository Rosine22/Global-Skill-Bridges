import React from 'react';
import { badgeStyles } from '../styles/design-tokens';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger' | 'gray';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  className?: string;
}

/**
 * Unified Badge Component - 4-Color System
 * 
 * Color Guide:
 * - primary (teal): Primary status - Active, Verified, Primary
 * - success (green): Success status - Approved, Completed, Success
 * - secondary (blue): Info/In Progress - New, Info, In Progress
 * - warning (yellow): Pending/Warning - Pending, Under Review
 * - danger (red): Negative status - Rejected, Failed, Cancelled
 * - gray: Neutral status - Inactive, Draft, Archived
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
}) => {
  const getBadgeClass = () => {
    if (size === 'small') {
      return badgeStyles[`${variant}Small` as keyof typeof badgeStyles];
    }
    return badgeStyles[variant];
  };

  return (
    <span className={`${getBadgeClass()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
