import React from 'react';
import { themes, Theme } from '@/lib/themes';

type ThemeSwitcherProps = {
  currentTheme: string;
  setTheme: (theme: string) => void;
};

export default function ThemeSwitcher({ currentTheme, setTheme }: ThemeSwitcherProps) {
  return (
    <div className="flex justify-center mb-4">
      {Object.entries(themes).map(([key, theme]) => (
        <button
          key={key}
          className={`px-4 py-2 rounded-full mx-2 ${
            currentTheme === key
              ? `bg-${theme.primary.split('-')[1]}-500 text-gray-900`
              : `bg-gray-700 ${theme.text} hover:bg-gray-600`
          }`}
          onClick={() => setTheme(key)}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}