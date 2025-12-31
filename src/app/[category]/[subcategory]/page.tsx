"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
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
  BookOpen,
  Bookmark,
  GraduationCap,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { SectionRenderer } from "@/components/content/SectionRenderer";
import type { OverviewData, ArticleItem } from "@/types/overview";

interface PageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

const categoryColors: Record<string, string> = {
  infrastructure: "from-blue-500 to-cyan-500",
  container: "from-purple-500 to-pink-500",
  languages: "from-orange-500 to-yellow-500",
  frontend: "from-green-500 to-emerald-500",
  backend: "from-indigo-500 to-purple-500",
  database: "from-red-500 to-orange-500",
  toolchain: "from-gray-500 to-slate-500",
};

const categoryBgColors: Record<string, string> = {
  infrastructure: "bg-blue-50 dark:bg-blue-950/30",
  container: "bg-purple-50 dark:bg-purple-950/30",
  languages: "bg-orange-50 dark:bg-orange-950/30",
  frontend: "bg-green-50 dark:bg-green-950/30",
  backend: "bg-indigo-50 dark:bg-indigo-950/30",
  database: "bg-red-50 dark:bg-red-950/30",
  toolchain: "bg-gray-50 dark:bg-gray-950/30",
};

const subcategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  network: Network,
  linux: Terminal,
  cloud: Cloud,
  docker: Box,
  kubernetes: Layers,
  "service-mesh": GitBranch,
  git: GitBranch,
  python: Code,
  go: Code,
  rust: Code,
  typescript: Code,
  react: Layout,
  vue: Layout,
  css: Layout,
  api: Globe,
  microservices: Server,
  "message-queue": Container,
  relational: Database,
  nosql: Database,
  modeling: Database,
  cicd: Wrench,
  monitoring: Wrench,
};

// Priority badge colors
const priorityConfig: Record<string, { label: Record<string, string>; color: string }> = {
  recommended: {
    label: { zh: "推荐", ja: "おすすめ" },
    color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  },
  essential: {
    label: { zh: "基础", ja: "基本" },
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  },
  important: {
    label: { zh: "重要", ja: "重要" },
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  },
  advanced: {
    label: { zh: "进阶", ja: "上級" },
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  },
};

export default function SubcategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useI18n();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const { category, subcategory } = resolvedParams;

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        // Try to load new JSON format first
        const jsonRes = await fetch(
          `/content/${locale}/${category}/${subcategory}/_overview.json`
        );

        if (jsonRes.ok) {
          const data = await jsonRes.json();
          // Check if it's new format (has sections array)
          if (data.sections) {
            setOverview(data);
          } else {
            // Legacy format - convert to new format
            setOverview({
              meta: {
                title: data.meta?.title || subcategory,
                description: data.meta?.description || "",
              },
              sections: [],
              relatedTopics: data.meta?.relatedTopics || [],
              articles: [],
            });
          }
        }
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [locale, category, subcategory]);

  const getCategoryInfo = () => {
    const navKey = category as keyof typeof t.nav;
    const navItem = t.nav[navKey];
    if (navItem?.children) {
      const sub = navItem.children.find((c) => c.key === subcategory);
      return {
        categoryLabel: navItem.label,
        subcategoryLabel: sub?.label || subcategory,
      };
    }
    return {
      categoryLabel: category,
      subcategoryLabel: subcategory,
    };
  };

  const { categoryLabel, subcategoryLabel } = getCategoryInfo();
  const colorClass = categoryColors[category] || "from-gray-500 to-slate-500";
  const bgColorClass = categoryBgColors[category] || "bg-gray-50 dark:bg-gray-950/30";
  const SubIcon = subcategoryIcons[subcategory] || FileText;

  const articles = overview?.articles || [];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                          dark:from-gray-900 dark:to-gray-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                        dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t.common.home}
            </Link>
            <span>/</span>
            <Link href={`/${category}`} className="hover:text-blue-600 transition-colors">
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{subcategoryLabel}</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg`}>
              <SubIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600
                               dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {overview?.meta.title || subcategoryLabel}
                </span>
              </h1>
              {overview?.meta.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                  {overview.meta.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {overview && overview.sections.length > 0 && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {overview.sections.map((section, index) => (
              <SectionRenderer
                key={index}
                section={section}
                colorClass={colorClass}
                locale={locale}
              />
            ))}

            {/* Related Topics */}
            {overview.relatedTopics && overview.relatedTopics.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bookmark className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {locale === "zh" ? "相关主题" : "関連トピック"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {overview.relatedTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800
                                   rounded-full text-sm text-gray-600 dark:text-gray-400
                                   hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Learning Path / Articles Section */}
      {articles.length > 0 && (
        <section className={`py-10 ${bgColorClass}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {locale === "zh" ? "学习路径" : "学習パス"}
              </h2>
              <span className="ml-auto text-sm text-gray-500">
                {articles.length} {locale === "zh" ? "篇文章" : "件の記事"}
              </span>
            </div>

            <div className="space-y-3">
              {articles.map((article: ArticleItem, index: number) => {
                const priority = article.priority ? priorityConfig[article.priority] : null;
                return (
                  <Link
                    key={article.slug}
                    href={`/${category}/${subcategory}/${article.slug}`}
                    className="group block bg-white dark:bg-gray-900 rounded-xl
                               border border-gray-200 dark:border-gray-800
                               hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700
                               transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Left accent bar */}
                      <div className={`w-1 bg-gradient-to-b ${colorClass} flex-shrink-0
                                      group-hover:w-1.5 transition-all duration-300`} />

                      <div className="flex-1 p-4 sm:p-5 flex items-center gap-4">
                        {/* Article number */}
                        <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center
                                        bg-gradient-to-br ${colorClass} rounded-lg
                                        text-white font-semibold text-sm shadow-sm`}>
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white
                                         group-hover:text-blue-600 dark:group-hover:text-blue-400
                                         transition-colors truncate">
                              {article.title}
                            </h3>
                            {priority && (
                              <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${priority.color}`}>
                                {priority.label[locale] || priority.label.zh}
                              </span>
                            )}
                          </div>
                          {article.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {article.description}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 text-gray-300 dark:text-gray-600
                                        group-hover:text-blue-500 transition-colors">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {(!overview || (overview.sections.length === 0 && articles.length === 0)) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 text-base mb-1">
                {locale === "zh" ? "暂无内容" : "コンテンツがありません"}
              </p>
              <p className="text-gray-400 text-sm">
                {locale === "zh" ? "敬请期待更多内容" : "もうすぐコンテンツが追加されます"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
