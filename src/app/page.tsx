"use client";

import Link from "next/link";
import {
  Server,
  Container,
  Code,
  Layout,
  Database,
  Wrench,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

const categoryIcons = {
  infrastructure: Server,
  container: Container,
  languages: Code,
  frontend: Layout,
  backend: Globe,
  database: Database,
  toolchain: Wrench,
};

const categoryColors = {
  infrastructure: "from-blue-500 to-cyan-500",
  container: "from-purple-500 to-pink-500",
  languages: "from-orange-500 to-yellow-500",
  frontend: "from-green-500 to-emerald-500",
  backend: "from-indigo-500 to-purple-500",
  database: "from-red-500 to-orange-500",
  toolchain: "from-gray-500 to-slate-500",
};

export default function HomePage() {
  const { t } = useI18n();

  const categories = [
    { ...t.nav.infrastructure, icon: "infrastructure" },
    { ...t.nav.container, icon: "container" },
    { ...t.nav.languages, icon: "languages" },
    { ...t.nav.frontend, icon: "frontend" },
    { ...t.nav.backend, icon: "backend" },
    { ...t.nav.database, icon: "database" },
    { ...t.nav.toolchain, icon: "toolchain" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                        dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.home.title}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            {t.home.subtitle}
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t.home.description}
          </p>
          <Link
            href="#categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white
                       rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.home.getStarted}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">{t.home.categories}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons];
              const colorClass = categoryColors[category.icon as keyof typeof categoryColors];

              return (
                <div
                  key={category.key}
                  className="group relative bg-white dark:bg-gray-900 rounded-xl
                             border border-gray-200 dark:border-gray-800 p-6
                             hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClass} mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{category.label}</h3>

                  {category.children && (
                    <ul className="space-y-2">
                      {category.children.slice(0, 3).map((child) => (
                        <li key={child.key}>
                          <Link
                            href={child.href || "#"}
                            className="text-sm text-gray-600 dark:text-gray-400
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
                    <p className="text-xs text-gray-400 mt-2">
                      +{category.children.length - 3} more
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
