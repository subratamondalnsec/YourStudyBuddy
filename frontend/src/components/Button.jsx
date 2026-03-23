import React from 'react';

function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseStyles = `
    inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background
    ${className}
  `;

  const variantStyles = {
    primary: `bg-indigo-600 text-white hover:bg-indigo-700`,
    ghost: `bg-transparent hover:bg-gray-100 text-gray-700`,
  };

  const sizeStyles = {
    sm: `px-2.5 py-1.5 text-sm`,
    md: `px-4 py-2 text-base`,
    lg: `px-6 py-3 text-lg`,
  };

  const variantClass = variantStyles[variant] || variantStyles.primary;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <button className={` ${baseStyles} ${variantClass} ${sizeClass}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
