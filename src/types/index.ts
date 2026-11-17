export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'developer';

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  shortDescription: string;
  longDescription?: string;
  iconName: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags: string[];
  acceptedFileTypes?: string;
  actionLabel?: string;
}

export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
  count: number;
}

export interface SEOArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  publishedDate: string;
  content: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
