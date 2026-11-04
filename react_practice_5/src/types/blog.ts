export type PostStatus = 'draft' | 'published' | 'scheduled';
export interface Category { id: number; name: string; slug: string }
export interface Tag { id: number; name: string; slug: string }
export interface AuthorInfo { id: number; email: string; first_name: string }
export interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  author_info: AuthorInfo;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  created_at: string;
  is_published: boolean;
  // Optional presentation-only image path. Not currently provided by Django PostSerializer.
  cover?: string;
}
export interface PostFilters { search: string; category: string; status: string; sort: string; page: number; limit: number }
export interface PaginatedPosts { results: Post[]; count: number; next: number | null; previous: number | null }
