"use client";

import Link from "next/link";
import {
  Server,
  Container,
  Code,
  Database,
  Wrench,
  Globe,
  Boxes,
  Shield,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

const categoryIcons = {
  infrastructure: Server,
  container: Container,
  languages: Code,
  backend: Globe,
  database: Database,
  architecture: Boxes,
  security: Shield,
  toolchain: Wrench,
};

const categoryColors = {
  infrastructure: "from-blue-500 to-cyan-500",
  container: "from-purple-500 to-pink-500",
  languages: "from-orange-500 to-yellow-500",
  backend: "from-indigo-500 to-purple-500",
  database: "from-red-500 to-orange-500",
  architecture: "from-teal-500 to-emerald-500",
  security: "from-rose-500 to-pink-500",
  toolchain: "from-gray-500 to-slate-500",
};

export default function HomePage() {
  const { t } = useI18n();

  const categories = [
    { ...t.nav.infrastructure, icon: "infrastructure" },
    { ...t.nav.container, icon: "container" },
    { ...t.nav.languages, icon: "languages" },
    { ...t.nav.backend, icon: "backend" },
    { ...t.nav.database, icon: "database" },
    { ...t.nav.architecture, icon: "architecture" },
    { ...t.nav.security, icon: "security" },
    { ...t.nav.toolchain, icon: "toolchain" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                        dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.home.title}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
            {t.home.subtitle}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-1">
            {t.home.description}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-2xl mx-auto italic">
            {t.home.philosophy}
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-6">{t.home.categories}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons];
              const colorClass = categoryColors[category.icon as keyof typeof categoryColors];

              return (
                <div
                  key={category.key}
                  className="group relative bg-white dark:bg-gray-900 rounded-lg
                             border border-gray-200 dark:border-gray-800 p-4
                             hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClass} mb-3`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-base font-semibold mb-2">{category.label}</h3>

                  {category.children && (
                    <ul className="space-y-1">
                      {category.children.slice(0, 3).map((child) => (
                        <li key={child.key}>
                          <Link
                            href={child.href || "#"}
                            className="text-xs text-gray-600 dark:text-gray-400
                                       hover:text-blue-600 dark:hover:text-blue-400
                                       transition-colors flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {category.children && category.children.length > 3 && (
                    <p className="text-xs text-gray-400 mt-1">
                      +{category.children.length - 3} {t.common.moreItems}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
