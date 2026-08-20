export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContentTag {
  id: string;
  contentId: string;
  tagId: string;
  tag: Tag;
}

export interface CommentUser {
  id: string;
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
}

export interface Comment {
  id: string;
  userId: string;
  contentId: string;
  body: string;
  createdAt: string;
  user?: CommentUser | null;
}

export interface WatchHistoryContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoUrl: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  tags?: ContentTag[];
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  contentId: string;
  createdAt: string;
  content: WatchHistoryContent;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoUrl: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  tags: ContentTag[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}
