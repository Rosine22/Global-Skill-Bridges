import React from 'react';
import { buttonStyles } from '../styles/design-tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'outlineSecondary' | 'outlineSuccess' | 'outlineDanger' | 'ghost' | 'ghostSecondary' | 'ghostGray';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Unified Button Component - 4-Color System
 * 
 * Color Guide:
 * - primary (teal): Main actions - Submit, Save, Create, Post, Get Started
 * - secondary (blue): Alternative actions - View, Info, Back, Cancel
 * - success (green): Positive actions - Approve, Accept, Confirm, Complete
 * - danger (red): Destructive actions - Delete, Reject, Remove
 * 
 * Examples:
 * <Button variant="primary">Submit</Button>
 * <Button variant="secondary" size="small">View Details</Button>
 * <Button variant="success" icon={<Check />}>Approve</Button>
 * <Button variant="danger" icon={<Trash />}>Delete</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const getButtonClass = () => {
    const sizeMap = {
      small: `${variant}Small`,
      medium: variant,
      large: `${variant}Large`,
    };
    
    const styleKey = sizeMap[size] as keyof typeof buttonStyles;
    return buttonStyles[styleKey] || buttonStyles[variant];
  };

  return (
    <button 
      className={`${getButtonClass()} ${className} inline-flex items-center justify-center`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;
