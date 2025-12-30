"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { NavItem } from "@/types/i18n";

interface NavDropdownProps {
  item: NavItem;
}

export function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveSubmenu(null);
    }, 150);
  };

  const handleSubmenuEnter = (key: string) => {
    setActiveSubmenu(key);
  };

  if (!item.children) {
    return (
      <Link
        href={item.href || "#"}
        className="px-4 py-2 text-sm font-medium hover:text-blue-600 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium
                   hover:text-blue-600 transition-colors"
      >
        {item.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200
                          dark:border-gray-700 rounded-lg shadow-xl min-w-[220px]">
            {item.children.map((child) => (
              <div
                key={child.key}
                className="relative"
                onMouseEnter={() => handleSubmenuEnter(child.key)}
              >
                <Link
                  href={child.href || `/${item.key}/${child.key}`}
                  className="flex items-center justify-between px-4 py-2.5
                             hover:bg-gray-50 dark:hover:bg-gray-800
                             first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="text-sm">{child.label}</span>
                  {child.children && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </Link>

                {child.children && activeSubmenu === child.key && (
                  <div className="absolute left-full top-0 ml-0.5 z-50">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200
                                    dark:border-gray-700 rounded-lg shadow-xl min-w-[180px]">
                      {child.children.map((subChild) => (
                        <Link
                          key={subChild.key}
                          href={subChild.href || "#"}
                          className="block px-4 py-2.5 text-sm hover:bg-gray-50
                                     dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {subChild.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
