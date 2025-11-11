import React from 'react';
import { buttonStyles } from '../styles/design-tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'outlineSecondary' | 'outlineSuccess' | 'outlineDanger' | 'ghost' | 'ghostSecondary' | 'ghostGray';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
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
