import { Locale } from "./i18n";
import { ContentSection } from "./overview";

export interface ContentMeta {
  title: string;
  description: string;
  order?: number;
  tags?: string[];
  lastUpdated?: string;
}

// Article can have either HTML content (from markdown) or sections (modular JSON)
export interface ContentItem {
  slug: string;
  meta: ContentMeta;
  content?: string; // HTML content from markdown
  sections?: ContentSection[]; // Modular content sections
  relatedTopics?: string[];
}

export interface CategoryMeta {
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface ContentPath {
  locale: Locale;
  category: string;
  subcategory?: string;
  slug?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface ContentNavItem {
  slug: string;
  title: string;
  description?: string;
  href: string;
  order: number;
}

export interface ContentCategory {
  key: string;
  title: string;
  items: ContentNavItem[];
}
