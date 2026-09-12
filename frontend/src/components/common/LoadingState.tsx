import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading publication content...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-secondary)', marginBottom: '0.75rem' }} />
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
};

