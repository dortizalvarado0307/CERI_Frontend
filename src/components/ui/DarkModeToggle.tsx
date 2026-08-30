import { useState, useEffect } from 'react';
import './DarkModeToggle.css';

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    const html = document.documentElement;
    
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const toggle = () => {
    setIsDark(prev => !prev);
  };

  return (
    <button
      className={`toggle ${isDark ? 'on' : ''} ${className}`}
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      type="button"
    >
      <span className="toggle__thumb" />
    </button>
  );
}
