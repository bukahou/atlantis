"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/navigation";
import { useI18n } from "@/i18n/context";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            {t.common.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
