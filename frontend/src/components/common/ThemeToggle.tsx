import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        padding: '0.4rem 0.8rem',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text)',
      }}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      <span style={{ fontSize: '0.85rem' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};
