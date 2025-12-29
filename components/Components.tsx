import React from 'react';
import { Loader2, Plus, Minus } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost', 
  size?: 'sm' | 'md' | 'lg',
  isLoading?: boolean 
}> = 
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray', className?: string }> = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const QuantityControl: React.FC<{ quantity: number, onIncrease: () => void, onDecrease: () => void }> = ({ quantity, onIncrease, onDecrease }) => (
  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
    <button onClick={onDecrease} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors">
      <Minus className="h-4 w-4" />
    </button>
    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
    <button onClick={onIncrease} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors">
      <Plus className="h-4 w-4" />
    </button>
  </div>
);