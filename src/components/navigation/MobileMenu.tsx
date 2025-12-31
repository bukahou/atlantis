"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { NavItem } from "@/types/i18n";

interface MobileMenuProps {
  items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedL1, setExpandedL1] = useState<string | null>(null);
  const [expandedL2, setExpandedL2] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleL1 = (key: string) => {
    setExpandedL1(expandedL1 === key ? null : key);
    setExpandedL2(null);
  };

  const toggleL2 = (key: string) => {
    setExpandedL2(expandedL2 === key ? null : key);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100
                   dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`fixed top-14 right-0 w-72 max-h-[calc(100vh-3.5rem)] overflow-y-auto
                    bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
                    shadow-xl z-50 xl:hidden transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <nav className="py-2">
          {items.map((item) => (
            <div key={item.key} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              {/* 一级菜单 */}
              <button
                onClick={() => toggleL1(item.key)}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span>{item.label}</span>
                {item.children && (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform
                                ${expandedL1 === item.key ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* 二级菜单 */}
              {item.children && expandedL1 === item.key && (
                <div className="bg-gray-50 dark:bg-gray-800/50">
                  {item.children.map((child) => (
                    <div key={child.key}>
                      {child.children ? (
                        <>
                          {/* 有三级菜单的二级项 */}
                          <button
                            onClick={() => toggleL2(child.key)}
                            className="flex items-center justify-between w-full px-6 py-2 text-sm
                                       text-gray-700 dark:text-gray-300 hover:bg-gray-100
                                       dark:hover:bg-gray-700 transition-colors"
                          >
                            <span>{child.label}</span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform
                                          ${expandedL2 === child.key ? "rotate-90" : ""}`}
                            />
                          </button>

                          {/* 三级菜单 */}
                          {expandedL2 === child.key && (
                            <div className="bg-gray-100 dark:bg-gray-700/50 py-1">
                              {child.children.map((subChild) => (
                                <Link
                                  key={subChild.key}
                                  href={subChild.href || "#"}
                                  onClick={() => setIsOpen(false)}
                                  className="block px-8 py-1.5 text-xs text-gray-600 dark:text-gray-400
                                             hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {subChild.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* 没有三级菜单的二级项 */
                        <Link
                          href={child.href || `/${item.key}/${child.key}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-6 py-2 text-sm text-gray-700 dark:text-gray-300
                                     hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {child.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
