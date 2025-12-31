"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Network,
  Terminal,
  Cloud,
  Box,
  Layers,
  GitBranch,
  Code,
  Layout,
  Globe,
  Server,
  Container,
  Database,
  Wrench,
  FileText,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { ArticleContent, ContentSidebar } from "@/components/content";
import { ContentItem, ContentNavItem } from "@/types/content";

interface PageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
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

export default function ContentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useI18n();
  const [article, setArticle] = useState<ContentItem | null>(null);
  const [navItems, setNavItems] = useState<ContentNavItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { category, subcategory, slug } = resolvedParams;

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const articleRes = await fetch(
          `/api/content/${locale}/${category}/${subcategory}/${slug}.json`
        );
        if (articleRes.ok) {
          const articleData = await articleRes.json();
          setArticle(articleData);
        } else {
          setArticle(null);
        }

        const indexRes = await fetch(
          `/api/content/${locale}/${category}/${subcategory}/_index.json`
        );
        if (indexRes.ok) {
          const indexData = await indexRes.json();
          setNavItems(indexData.items || []);
        }
      } catch (error) {
        console.error("Failed to load content:", error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [locale, category, subcategory, slug]);

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
  const SubIcon = subcategoryIcons[subcategory] || FileText;

  // Get prev/next articles
  const currentIndex = navItems.findIndex((item) => item.slug === slug);
  const prevArticle = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextArticle = currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                          dark:from-gray-900 dark:to-gray-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72" />
            </div>
          </div>
        </section>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <div className="w-64 shrink-0">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                          dark:from-gray-900 dark:to-gray-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <h1 className="text-2xl font-bold mb-4">
              {locale === "zh" ? "内容未找到" : "コンテンツが見つかりません"}
            </h1>
            <p className="text-gray-500 mb-8">
              {locale === "zh"
                ? "请确认该内容已创建对应语言版本"
                : "対応する言語バージョンが作成されているか確認してください"}
            </p>
            <Link
              href={`/${category}/${subcategory}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                         rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {locale === "zh" ? "返回列表" : "一覧に戻る"}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                        dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              {t.common.home}
            </Link>
            <span>/</span>
            <Link href={`/${category}`} className="hover:text-blue-600 transition-colors">
              {categoryLabel}
            </Link>
            <span>/</span>
            <Link href={`/${category}/${subcategory}`} className="hover:text-blue-600 transition-colors">
              {subcategoryLabel}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[200px]">
              {article.meta.title}
            </span>
          </nav>

          <div className="flex items-start gap-6">
            <div className={`hidden sm:flex flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}>
              <SubIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600
                               dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {article.meta.title}
                </span>
              </h1>
              {article.meta.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-3xl">
                  {article.meta.description}
                </p>
              )}
              {article.meta.tags && article.meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-xs font-medium bg-gradient-to-r ${colorClass}
                                  text-white rounded-full`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {navItems.length > 0 && (
              <ContentSidebar
                title={subcategoryLabel}
                items={navItems}
                colorClass={colorClass}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                              dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                <ArticleContent article={article} />
              </div>

              {/* Prev/Next Navigation */}
              {(prevArticle || nextArticle) && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {prevArticle ? (
                    <Link
                      href={prevArticle.href}
                      className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900
                                 rounded-xl border border-gray-200 dark:border-gray-800
                                 hover:border-blue-300 dark:hover:border-blue-700
                                 hover:shadow-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600
                                              dark:group-hover:text-blue-400 transition-colors" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          {locale === "zh" ? "上一篇" : "前の記事"}
                        </p>
                        <p className="font-medium text-sm truncate group-hover:text-blue-600
                                      dark:group-hover:text-blue-400 transition-colors">
                          {prevArticle.title}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextArticle && (
                    <Link
                      href={nextArticle.href}
                      className="group flex items-center justify-end gap-4 p-4 bg-white
                                 dark:bg-gray-900 rounded-xl border border-gray-200
                                 dark:border-gray-800 hover:border-blue-300
                                 dark:hover:border-blue-700 hover:shadow-md transition-all text-right"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          {locale === "zh" ? "下一篇" : "次の記事"}
                        </p>
                        <p className="font-medium text-sm truncate group-hover:text-blue-600
                                      dark:group-hover:text-blue-400 transition-colors">
                          {nextArticle.title}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600
                                               dark:group-hover:text-blue-400 transition-colors" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
