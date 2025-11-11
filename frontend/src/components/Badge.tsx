import React from 'react';
import { badgeStyles } from '../styles/design-tokens';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger' | 'gray';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  className?: string;
}

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
