import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && id && (
        <label htmlFor={id} className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg bg-zinc-50 border text-sm text-zinc-900 placeholder-zinc-400 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 outline-none transition-all duration-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-200 dark:border-zinc-800'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
