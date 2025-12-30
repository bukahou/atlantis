"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Folder,
  Server,
  Container,
  Code,
  Layout,
  Globe,
  Database,
  Wrench,
  Network,
  Terminal,
  Cloud,
  Box,
  Layers,
  GitBranch,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  infrastructure: Server,
  container: Container,
  languages: Code,
  frontend: Layout,
  backend: Globe,
  database: Database,
  toolchain: Wrench,
};

const categoryColors: Record<string, string> = {
  infrastructure: "from-blue-500 to-cyan-500",
  container: "from-purple-500 to-pink-500",
  languages: "from-orange-500 to-yellow-500",
  frontend: "from-green-500 to-emerald-500",
  backend: "from-indigo-500 to-purple-500",
  database: "from-red-500 to-orange-500",
  toolchain: "from-gray-500 to-slate-500",
};

const subcategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  network: Network,
  linux: Terminal,
  cloud: Cloud,
  docker: Box,
  kubernetes: Layers,
  "service-mesh": GitBranch,
  git: GitBranch,
};

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { t } = useI18n();

  const { category } = resolvedParams;

  const getCategoryInfo = () => {
    const navKey = category as keyof typeof t.nav;
    const navItem = t.nav[navKey];
    if (navItem) {
      return {
        label: navItem.label,
        children: navItem.children || [],
      };
    }
    return { label: category, children: [] };
  };

  const { label, children } = getCategoryInfo();
  const CategoryIcon = categoryIcons[category] || Folder;
  const colorClass = categoryColors[category] || "from-gray-500 to-slate-500";

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                        dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t.common.home}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{label}</span>
          </nav>

          <div className="flex items-center gap-6">
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg`}>
              <CategoryIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600
                               dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {label}
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {children.length} {t.common.subcategories || "subcategories"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((sub) => {
                const SubIcon = subcategoryIcons[sub.key] || Folder;
                return (
                  <Link
                    key={sub.key}
                    href={sub.href || `/${category}/${sub.key}`}
                    className="group relative bg-white dark:bg-gray-900 rounded-xl
                               border border-gray-200 dark:border-gray-800 p-6
                               hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                               overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full
                                    bg-gradient-to-br ${colorClass} opacity-10
                                    group-hover:opacity-20 transition-opacity`} />

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center
                                        bg-gradient-to-br ${colorClass} rounded-xl shadow-md`}>
                          <SubIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-semibold group-hover:text-blue-600
                                         dark:group-hover:text-blue-400 transition-colors">
                            {sub.label}
                          </h2>
                        </div>
                      </div>

                      {sub.children && sub.children.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {sub.children.slice(0, 3).map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              {item.label}
                            </div>
                          ))}
                          {sub.children.length > 3 && (
                            <p className="text-xs text-gray-400 pl-3.5">
                              +{sub.children.length - 3} more
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400
                                      text-sm font-medium opacity-0 group-hover:opacity-100
                                      transition-opacity">
                        <span>{t.common.viewMore || "View more"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <Folder className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 text-lg">
                {t.common.noContent || "No content available"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
