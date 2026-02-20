'use client';

import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-inset
            ${
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="flex items-center gap-1 text-xs text-red-600">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16A8 8 0 0012 4z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
