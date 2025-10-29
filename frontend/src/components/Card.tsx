import React from 'react';
import { cardStyles } from '../styles/design-tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'noPadding';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  return (
    <div 
      className={`${cardStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
