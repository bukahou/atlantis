"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n/context";
import { NavDropdown } from "./NavDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const { t } = useI18n();

  const navItems = [
    t.nav.infrastructure,
    t.nav.container,
    t.nav.languages,
    t.nav.backend,
    t.nav.database,
    t.nav.architecture,
    t.nav.security,
    t.nav.toolchain,
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80
                       backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xl:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Atlantis Logo"
              width={32}
              height={32}
              className="w-7 h-7 xl:w-8 xl:h-8"
            />
            <span className="text-base xl:text-lg font-bold whitespace-nowrap">
              {t.common.siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center">
            {navItems.map((item) => (
              <NavDropdown key={item.key} item={item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 xl:gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <MobileMenu items={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
