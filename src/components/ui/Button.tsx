import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90 focus:ring-[#0A84FF]/50',
    secondary: 'bg-[#86868B] text-white hover:bg-[#86868B]/90 focus:ring-[#86868B]/50',
    success: 'bg-[#30D158] text-white hover:bg-[#30D158]/90 focus:ring-[#30D158]/50',
    error: 'bg-[#FF453A] text-white hover:bg-[#FF453A]/90 focus:ring-[#FF453A]/50',
    outline: 'bg-transparent border border-[#86868B] text-[#1D1D1F] hover:bg-[#F5F5F7] focus:ring-[#86868B]/50',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-3',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;