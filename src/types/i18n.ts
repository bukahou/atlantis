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
  };
  nav: {
    infrastructure: NavItem;
    container: NavItem;
    languages: NavItem;
    frontend: NavItem;
    backend: NavItem;
    database: NavItem;
    toolchain: NavItem;
  };
  home: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
    categories: string;
  };
}
