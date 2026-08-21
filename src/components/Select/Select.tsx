import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
}

export default function Select({
  options,
  label,
  error,
  placeholder,
  id,
  className = '',
  disabled,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && id && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-lg bg-slate-950 border text-sm text-slate-100 outline-none appearance-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed pr-10 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
