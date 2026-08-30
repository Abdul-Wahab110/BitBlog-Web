import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: 'var(--color-secondary)', color: '#FFFFFF' };
      case 'outline':
        return { backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' };
      case 'danger':
        return { backgroundColor: 'var(--color-danger)', color: '#FFFFFF' };
      case 'primary':
      default:
        return { backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.75rem', fontSize: '0.8rem' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
      case 'md':
      default:
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
    }
  };

  return (
    <button
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

