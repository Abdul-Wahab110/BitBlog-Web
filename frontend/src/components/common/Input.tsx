import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, style, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          width: '100%',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          outline: 'none',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
};

