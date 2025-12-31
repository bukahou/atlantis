export type Locale = "zh" | "ja";

export interface NavItem {
  key: string;
  label: string;
  href?: string;
  children?: NavItem[];
}

export interface Translations {
  common: {
    siteName: string;
    language: string;
    search: string;
    home: string;
    subcategories: string;
    viewMore: string;
    noContent: string;
    moreItems: string;
    footer: string;
  };
  nav: {
    infrastructure: NavItem;
    container: NavItem;
    languages: NavItem;
    backend: NavItem;
    database: NavItem;
    architecture: NavItem;
    security: NavItem;
    toolchain: NavItem;
  };
  home: {
    title: string;
    subtitle: string;
    description: string;
    philosophy: string;
    getStarted: string;
    categories: string;
  };
}
