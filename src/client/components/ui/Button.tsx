'use client';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  onClick,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      onClick={isLoading ? undefined : onClick}
      {...props}
    >
      {isLoading ? '처리중..' : children}
    </button>
  );
}
