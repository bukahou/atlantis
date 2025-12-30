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
  Clock,
  BookOpen,
  Lightbulb,
  Target,
  Bookmark,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { ContentNavItem } from "@/types/content";

interface PageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

interface OverviewData {
  meta: {
    title: string;
    description: string;
    keyPoints: string[];
    relatedTopics: string[];
  };
  content: string;
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

export default function SubcategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useI18n();
  const [articles, setArticles] = useState<ContentNavItem[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const { category, subcategory } = resolvedParams;

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        // Load articles and overview in parallel
        const [articlesRes, overviewRes] = await Promise.all([
          fetch(`/content/${locale}/${category}/${subcategory}/_index.json`),
          fetch(`/content/${locale}/${category}/${subcategory}/_overview.json`),
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.items || []);
        }

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
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
  const SubIcon = subcategoryIcons[subcategory] || FileText;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                          dark:from-gray-900 dark:to-gray-800" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8" />
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
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
            <Link href={`/${category}`} className="hover:text-blue-600 transition-colors">
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{subcategoryLabel}</span>
          </nav>

          <div className="flex items-center gap-6">
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg`}>
              <SubIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600
                               dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {subcategoryLabel}
                </span>
              </h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {articles.length} {locale === "zh" ? "篇文章" : "件の記事"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {articles.map((article, index) => (
                <Link
                  key={article.slug}
                  href={article.href}
                  className="group relative bg-white dark:bg-gray-900 rounded-xl
                             border border-gray-200 dark:border-gray-800 p-6
                             hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                             overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className={`absolute -right-12 -bottom-12 w-40 h-40 rounded-full
                                  bg-gradient-to-br ${colorClass} opacity-5
                                  group-hover:opacity-10 transition-opacity`} />

                  <div className="relative flex items-start gap-4">
                    {/* Article number */}
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center
                                    bg-gradient-to-br ${colorClass} rounded-xl shadow-md
                                    text-white font-bold text-lg`}>
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold mb-2 group-hover:text-blue-600
                                     dark:group-hover:text-blue-400 transition-colors
                                     line-clamp-2">
                        {article.title}
                      </h2>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {article.slug}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400
                                      text-sm font-medium opacity-0 group-hover:opacity-100
                                      transition-opacity">
                        <span>{locale === "zh" ? "阅读全文" : "続きを読む"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {locale === "zh" ? "暂无内容" : "コンテンツがありません"}
              </p>
              <p className="text-gray-400 text-sm">
                {locale === "zh" ? "敬请期待更多内容" : "もうすぐコンテンツが追加されます"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Overview Section */}
      {overview && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Key Points */}
            {overview.meta.keyPoints && overview.meta.keyPoints.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {locale === "zh" ? "核心要点" : "キーポイント"}
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {overview.meta.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800
                                 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center
                                      rounded-lg bg-gradient-to-br ${colorClass} text-white
                                      font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200
                           dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass}`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {locale === "zh" ? "知识概览" : "ナレッジ概要"}
                </h2>
              </div>
              <div
                className="prose prose-gray dark:prose-invert max-w-none p-6
                           prose-headings:font-bold prose-headings:text-gray-900
                           dark:prose-headings:text-white
                           prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                           prose-p:text-gray-600 dark:prose-p:text-gray-300
                           prose-a:text-blue-600 dark:prose-a:text-blue-400
                           prose-code:bg-gray-100 dark:prose-code:bg-gray-700
                           prose-code:px-1 prose-code:rounded
                           prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
                           prose-pre:text-gray-100
                           prose-table:border-collapse
                           prose-th:border prose-th:border-gray-300
                           dark:prose-th:border-gray-600 prose-th:p-2
                           prose-td:border prose-td:border-gray-300
                           dark:prose-td:border-gray-600 prose-td:p-2"
                dangerouslySetInnerHTML={{ __html: overview.content }}
              />
            </div>

            {/* Related Topics */}
            {overview.meta.relatedTopics && overview.meta.relatedTopics.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Bookmark className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    {locale === "zh" ? "相关主题" : "関連トピック"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {overview.meta.relatedTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800
                                 border border-gray-200 dark:border-gray-700
                                 rounded-full text-sm text-gray-600 dark:text-gray-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
