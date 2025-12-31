"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { Theme, themes, themeNames } from "@/theme";

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const CurrentIcon = themeIcons[theme];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{themeNames[theme][locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {themes.map((t) => {
            const Icon = themeIcons[t];
            return (
              <button
                key={t}
                onClick={() => handleSelect(t)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                           dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg
                           flex items-center gap-2
                           ${theme === t ? "text-blue-600 dark:text-blue-400 font-medium" : ""}`}
              >
                <Icon className="w-4 h-4" />
                {themeNames[t][locale]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
