import { FC, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('streak7-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('streak7-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button 
      className={`theme-toggle-btn ${className}`} 
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
    >
      <div className={`theme-toggle-track ${theme}`}>
        <span className="theme-toggle-icon sun"><Sun size={12} /></span>
        <span className="theme-toggle-icon moon"><Moon size={12} /></span>
        <div className="theme-toggle-thumb">
          {theme === 'light' ? <Sun size={11} /> : <Moon size={11} />}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
