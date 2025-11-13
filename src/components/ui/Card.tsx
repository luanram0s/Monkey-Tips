import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-secondary rounded-lg shadow-lg shadow-black/25 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;