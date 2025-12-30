import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import { Locale } from "@/types/i18n";
import { ContentItem, ContentMeta, ContentNavItem, CategoryMeta } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

export function getContentPath(locale: Locale, ...segments: string[]): string {
  return path.join(CONTENT_DIR, locale, ...segments);
}

export function getAllContentSlugs(
  locale: Locale,
  category: string,
  subcategory?: string
): string[] {
  const dir = subcategory
    ? getContentPath(locale, category, subcategory)
    : getContentPath(locale, category);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getCategoryMeta(
  locale: Locale,
  category: string,
  subcategory?: string
): CategoryMeta | null {
  const metaPath = subcategory
    ? getContentPath(locale, category, subcategory, "_meta.json")
    : getContentPath(locale, category, "_meta.json");

  if (!fs.existsSync(metaPath)) {
    return null;
  }

  const content = fs.readFileSync(metaPath, "utf-8");
  return JSON.parse(content) as CategoryMeta;
}

export async function getContentBySlug(
  locale: Locale,
  category: string,
  subcategory: string,
  slug: string
): Promise<ContentItem | null> {
  const filePath = getContentPath(locale, category, subcategory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const processedContent = await remark().use(gfm).use(html).process(content);

  return {
    slug,
    meta: data as ContentMeta,
    content: processedContent.toString(),
  };
}

export function getContentNavItems(
  locale: Locale,
  category: string,
  subcategory: string
): ContentNavItem[] {
  const slugs = getAllContentSlugs(locale, category, subcategory);
  const items: ContentNavItem[] = [];

  for (const slug of slugs) {
    const filePath = getContentPath(locale, category, subcategory, `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    const meta = data as ContentMeta;

    items.push({
      slug,
      title: meta.title,
      href: `/${category}/${subcategory}/${slug}`,
      order: meta.order ?? 999,
    });
  }

  return items.sort((a, b) => a.order - b.order);
}

export function getAllCategories(locale: Locale): string[] {
  const localeDir = getContentPath(locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  return fs
    .readdirSync(localeDir)
    .filter((item) => {
      const itemPath = path.join(localeDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
}

export function getSubcategories(locale: Locale, category: string): string[] {
  const categoryDir = getContentPath(locale, category);

  if (!fs.existsSync(categoryDir)) {
    return [];
  }

  return fs
    .readdirSync(categoryDir)
    .filter((item) => {
      const itemPath = path.join(categoryDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
}

export function extractTableOfContents(htmlContent: string) {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[1-6]>/g;
  const toc: { id: string; title: string; level: number }[] = [];

  let match;
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    toc.push({
      level: parseInt(match[1], 10),
      id: match[2],
      title: match[3],
    });
  }

  return toc;
}
