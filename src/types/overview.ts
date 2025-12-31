// Content block types for structured overview data

export type SectionType =
  | "keyPoints"      // Key points with icons (2x2 grid)
  | "comparison"     // Side-by-side comparison (e.g., OSI vs TCP/IP)
  | "flow"           // Flow diagram with arrows
  | "cards"          // Card grid for topics/paths
  | "table"          // Data table
  | "list"           // Bullet list with descriptions
  | "text"           // Plain text paragraph
  | "codeBlock";     // Code example

// Base section interface
interface BaseSection {
  type: SectionType;
  title?: string;
  subtitle?: string;
}

// Key points section (2x2 or 2xN grid)
export interface KeyPointsSection extends BaseSection {
  type: "keyPoints";
  items: string[];
}

// Comparison section (side-by-side columns)
export interface ComparisonColumn {
  title: string;
  color?: string; // Tailwind color class
  items: Array<{
    label: string;
    description?: string;
  }>;
}

export interface ComparisonSection extends BaseSection {
  type: "comparison";
  columns: ComparisonColumn[];
}

// Flow diagram section
export interface FlowStep {
  label: string;
  description?: string;
  color?: string;
}

export interface FlowSection extends BaseSection {
  type: "flow";
  direction?: "horizontal" | "vertical";
  steps: FlowStep[];
}

// Cards section (for learning paths, topics, etc.)
export interface CardItem {
  title: string;
  description?: string;
  points?: string[];
  icon?: string;
  badge?: string;
  badgeColor?: string;
  href?: string;
}

export interface CardsSection extends BaseSection {
  type: "cards";
  layout?: "grid" | "list";
  columns?: 2 | 3 | 4;
  items: CardItem[];
}

// Table section
export interface TableSection extends BaseSection {
  type: "table";
  headers: string[];
  rows: string[][];
  highlightFirst?: boolean;
}

// List section with descriptions
export interface ListItem {
  label: string;
  description?: string;
}

export interface ListSection extends BaseSection {
  type: "list";
  style?: "bullet" | "numbered" | "check";
  items: ListItem[];
}

// Text section
export interface TextSection extends BaseSection {
  type: "text";
  content: string;
}

// Code block section
export interface CodeBlockSection extends BaseSection {
  type: "codeBlock";
  language?: string;
  code: string;
}

// Union type for all sections
export type ContentSection =
  | KeyPointsSection
  | ComparisonSection
  | FlowSection
  | CardsSection
  | TableSection
  | ListSection
  | TextSection
  | CodeBlockSection;

// Article with priority
export interface ArticleItem {
  slug: string;
  title: string;
  description: string;
  priority?: "recommended" | "essential" | "important" | "advanced";
}

// Complete overview data structure
export interface OverviewData {
  meta: {
    title: string;
    description: string;
    icon?: string;
  };
  sections: ContentSection[];
  relatedTopics?: string[];
  articles?: ArticleItem[];
}
