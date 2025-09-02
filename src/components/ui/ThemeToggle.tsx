import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Sun className="w-5 h-5 text-slate-400 dark:text-slate-300" />
        )}
      </div>
      {showLabel && (
        <motion.span
          animate={{
            display: 'inline-block',
            opacity: 1,
          }}
          className="text-slate-600 dark:text-slate-400 text-sm transition duration-150 whitespace-pre"
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </motion.span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
