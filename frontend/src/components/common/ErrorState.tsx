import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Content',
  message = 'An unexpected error occurred while fetching content from the server.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-danger)',
        textAlign: 'center',
      }}
    >
      <AlertCircle size={36} color="var(--color-danger)" style={{ marginBottom: '0.75rem' }} />
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: '1.25rem' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: '#FFF',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={14} /> Retry Request
        </button>
      )}
    </div>
  );
};
