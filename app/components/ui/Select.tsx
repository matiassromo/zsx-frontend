'use client';

import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-md border px-3 py-2 text-sm
            focus:outline-none focus:ring-1
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
          <p id={`${selectId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
