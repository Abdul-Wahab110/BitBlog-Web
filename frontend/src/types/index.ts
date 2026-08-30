export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER';

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  colorHex?: string;
  totalPosts?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  totalPosts?: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImageUrl?: string;
  category: Category;
  author: User;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  isFeatured: boolean;
  readTimeMinutes: number;
  viewsCount: number;
  commentCount: number;
  likeCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface AdminStats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  draftPosts: number;
  scheduledPosts: number;
}

