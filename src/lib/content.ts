import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

export interface ArticleMeta {
  title: string;
  description?: string;
  order?: number;
  tags?: string[];
}

export interface ArticleNavItem {
  slug: string;
  title: string;
  description?: string;
  order: number;
  href: string;
}

export interface OverviewData {
  meta: {
    title: string;
    description?: string;
    icon?: string;
  };
  sections: unknown[];
  relatedTopics?: string[];
  articles?: Array<{
    slug: string;
    title: string;
    description?: string;
    priority?: string;
  }>;
}

export interface ArticleData {
  slug: string;
  meta: ArticleMeta;
  sections?: unknown[];
  content?: string;
  relatedTopics?: string[];
}

/**
 * 读取 _overview.json 文件
 */
export function getOverview(
  locale: string,
  category: string,
  subcategory: string
): OverviewData | null {
  const filePath = path.join(
    CONTENT_DIR,
    locale,
    category,
    subcategory,
    "_overview.json"
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read overview: ${filePath}`, error);
    return null;
  }
}

/**
 * 读取单篇文章
 */
export function getArticle(
  locale: string,
  category: string,
  subcategory: string,
  slug: string
): ArticleData | null {
  const filePath = path.join(
    CONTENT_DIR,
    locale,
    category,
    subcategory,
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return {
      slug,
      meta: {
        title: data.meta?.title || slug,
        description: data.meta?.description || "",
        order: data.meta?.order || 999,
        tags: data.meta?.tags || [],
      },
      sections: data.sections || [],
      relatedTopics: data.relatedTopics || [],
    };
  } catch (error) {
    console.error(`Failed to read article: ${filePath}`, error);
    return null;
  }
}

/**
 * 获取子分类下的文章列表（用于导航）
 */
export function getArticleList(
  locale: string,
  category: string,
  subcategory: string
): ArticleNavItem[] {
  const dir = path.join(CONTENT_DIR, locale, category, subcategory);

  if (!fs.existsSync(dir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(dir).filter((f) => {
      return f.endsWith(".json") && !f.startsWith("_");
    });

    return files
      .map((f) => {
        const filePath = path.join(dir, f);
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);
        const slug = f.replace(".json", "");

        return {
          slug,
          title: data.meta?.title || slug,
          description: data.meta?.description || "",
          order: data.meta?.order || 999,
          href: `/${category}/${subcategory}/${slug}`,
        };
      })
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error(`Failed to read article list: ${dir}`, error);
    return [];
  }
}

/**
 * 获取所有可用的路径（用于 generateStaticParams）
 */
export function getAllArticlePaths(): Array<{
  category: string;
  subcategory: string;
  slug: string;
}> {
  const paths: Array<{ category: string; subcategory: string; slug: string }> = [];
  const locales = ["zh", "ja"];

  for (const locale of locales) {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;

    const categories = fs.readdirSync(localeDir).filter((item) => {
      return fs.statSync(path.join(localeDir, item)).isDirectory();
    });

    for (const category of categories) {
      const categoryDir = path.join(localeDir, category);
      const subcategories = fs.readdirSync(categoryDir).filter((item) => {
        return fs.statSync(path.join(categoryDir, item)).isDirectory();
      });

      for (const subcategory of subcategories) {
        const subcategoryDir = path.join(categoryDir, subcategory);
        const files = fs.readdirSync(subcategoryDir).filter((f) => {
          return f.endsWith(".json") && !f.startsWith("_");
        });

        for (const file of files) {
          const slug = file.replace(".json", "");
          // 避免重复（两个 locale 可能有相同的路径结构）
          const exists = paths.some(
            (p) =>
              p.category === category &&
              p.subcategory === subcategory &&
              p.slug === slug
          );
          if (!exists) {
            paths.push({ category, subcategory, slug });
          }
        }
      }
    }
  }

  return paths;
}

/**
 * 获取所有子分类路径（用于 generateStaticParams）
 */
export function getAllSubcategoryPaths(): Array<{
  category: string;
  subcategory: string;
}> {
  const paths: Array<{ category: string; subcategory: string }> = [];
  const locales = ["zh", "ja"];

  for (const locale of locales) {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;

    const categories = fs.readdirSync(localeDir).filter((item) => {
      return fs.statSync(path.join(localeDir, item)).isDirectory();
    });

    for (const category of categories) {
      const categoryDir = path.join(localeDir, category);
      const subcategories = fs.readdirSync(categoryDir).filter((item) => {
        return fs.statSync(path.join(categoryDir, item)).isDirectory();
      });

      for (const subcategory of subcategories) {
        const exists = paths.some(
          (p) => p.category === category && p.subcategory === subcategory
        );
        if (!exists) {
          paths.push({ category, subcategory });
        }
      }
    }
  }

  return paths;
}
