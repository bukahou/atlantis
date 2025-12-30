"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { localeNames } from "@/i18n";
import { Locale } from "@/types/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
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

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{localeNames[locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900
                        border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {(Object.keys(localeNames) as Locale[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                         dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg
                         ${locale === key ? "text-blue-600 font-medium" : ""}`}
            >
              {localeNames[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
