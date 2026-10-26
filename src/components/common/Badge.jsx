import React from 'react';

/**
 * Reusable Badge component for status indicators.
 * Supported variants: 'success', 'warning', 'danger', 'info', 'neutral'
 */
export default function Badge({ children, variant = 'neutral', size = 'sm' }) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
  };

  const appliedClass = variantClasses[variant] || variantClasses.neutral;
  const appliedSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <span className={`badge ${appliedClass} ${appliedSize}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
