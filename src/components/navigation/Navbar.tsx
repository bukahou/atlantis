"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { NavDropdown } from "./NavDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useI18n();

  const navItems = [
    t.nav.infrastructure,
    t.nav.container,
    t.nav.languages,
    t.nav.frontend,
    t.nav.backend,
    t.nav.database,
    t.nav.toolchain,
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80
                       backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Atlantis Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-bold">{t.common.siteName}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center">
            {navItems.map((item) => (
              <NavDropdown key={item.key} item={item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500
                               bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200
                               dark:hover:bg-gray-700 transition-colors">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.common.search}</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs
                              bg-white dark:bg-gray-700 rounded border border-gray-300
                              dark:border-gray-600">
                /
              </kbd>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
