export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-800';

  const variants = {
    text: 'h-4 w-3/4 rounded',
    rect: 'h-24 w-full rounded-lg',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading..."
      className={`${baseStyles} ${variants[variant]} ${className}`}
    />
  );
}
