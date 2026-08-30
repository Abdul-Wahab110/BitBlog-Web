import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { config } from './env';

export interface DbSchema {
  users: Array<{
    user_id: number;
    role_id: number;
    role_name: string;
    name: string;
    username: string;
    email: string;
    password_hash: string;
    profile_image?: string;
    bio?: string;
    website?: string;
    author_tags?: string[];
    social_links?: any;
    short_description?: string;
    is_verified?: boolean | number;
    verification_token?: string;
    verification_expires?: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
    created_at: string;
    updated_at: string;
    last_login?: string;
  }>;
  roles: Array<{
    role_id: number;
    role_name: string;
    description: string;
  }>;
  categories: Array<{
    category_id: number;
    parent_category_id?: number;
    parent_id?: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
  }>;
  tags: Array<{
    tag_id: number;
    name: string;
    slug: string;
    created_at: string;
  }>;
  posts: Array<{
    post_id: number;
    author_id: number;
    author_name: string;
    author_username: string;
    author_avatar?: string;
    category_id?: number;
    category_name?: string;
    category_slug?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string;
    status: 'draft' | 'pending_review' | 'changes_requested' | 'rejected' | 'published' | 'scheduled' | 'archived';
    published_at?: string;
    scheduled_at?: string;
    reviewer_feedback?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    reading_time: number;
    views_count: number;
    comment_count: number;
    like_count: number;
    created_at: string;
    updated_at: string;
    tag_ids?: number[];
  }>;
  comments: Array<{
    comment_id: number;
    post_id: number;
    user_id: number;
    parent_comment_id?: number;
    author_name: string;
    author_username: string;
    author_avatar?: string;
    author_role?: string;
    content: string;
    status: 'APPROVED' | 'PENDING' | 'SPAM' | 'REJECTED';
    created_at: string;
    updated_at: string;
  }>;
  likes: Array<{
    like_id: number;
    post_id: number;
    user_id: number;
    created_at: string;
  }>;
  bookmarks: Array<{
    bookmark_id: number;
    post_id: number;
    user_id: number;
    created_at: string;
  }>;
  notifications: Array<{
    notification_id: number;
    user_id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
  settings: Record<string, string>;
  messages: Array<{
    message_id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'UNREAD' | 'READ';
    created_at: string;
  }>;
  subscribers: Array<{
    subscriber_id: number;
    email: string;
    name?: string;
    topics?: string[];
    status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | string;
    created_at: string;
    subscribed_at?: string;
    unsubscribed_at?: string;
    notes?: string;
  }>;
  media: Array<{
    media_id: number;
    filename: string;
    original_name: string;
    url: string;
    mimetype: string;
    size: number;
    alt_text?: string;
    uploaded_by: number;
    created_at: string;
  }>;
  seo?: Array<{
    seo_id: number;
    post_id?: number;
    page_identifier?: string;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    twitter_card?: string;
    robots?: string;
    focus_keyword?: string;
    secondary_keywords?: string;
    search_intent?: string;
    image_alt_text?: string;
    direct_answer?: string;
    key_takeaways?: string;
    faq_data?: string;
    howto_data?: string;
    references_data?: string;
    entity_context?: string;
    factual_context?: string;
    location_context?: string;
    created_at: string;
    updated_at: string;
  }>;
  role_applications?: Array<{
    application_id: number;
    user_id: number;
    name: string;
    username: string;
    email: string;
    role_applied: 'Author' | 'Editor';
    bio: string;
    sample_urls: string;
    topics: string[];
    motivation: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    created_at: string;
    updated_at: string;
    reviewed_by?: number;
    reviewed_at?: string;
  }>;
  audit_logs?: Array<{
    log_id: number;
    user_id?: number;
    user_name: string;
    user_role: string;
    action: string;
    category: 'AUTH' | 'POST' | 'APPLICATION' | 'COMMENT' | 'SETTINGS' | 'MEDIA' | 'USER_MANAGEMENT';
    details: string;
    ip_address?: string;
    severity: 'info' | 'success' | 'warning' | 'danger';
    created_at: string;
  }>;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const getDefaultSeedData = (): DbSchema => {
  const defaultAdminHash = bcrypt.hashSync('qwerty@11221', 10);
  const defaultEditorHash = bcrypt.hashSync('editor123', 10);
  const defaultAuthorHash = bcrypt.hashSync('author123', 10);
  const defaultUserHash = bcrypt.hashSync('user123', 10);
  const now = new Date().toISOString();

  return {
    roles: [
      { role_id: 1, role_name: 'Admin', description: 'Full system administration' },
      { role_id: 2, role_name: 'Editor', description: 'Editorial review and publishing' },
      { role_id: 3, role_name: 'Author', description: 'Article authoring' },
      { role_id: 4, role_name: 'User', description: 'Standard reader' },
    ],
    users: [
      {
        user_id: 1,
        role_id: 1,
        role_name: 'Admin',
        name: 'Abdul Wahab',
        username: 'admin',
        email: 'aw419770@gmail.com',
        password_hash: defaultAdminHash,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 2,
        role_id: 4,
        role_name: 'User',
        name: 'Demo Reader',
        username: 'reader',
        email: 'reader@bitblog.com',
        password_hash: defaultUserHash,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 3,
        role_id: 2,
        role_name: 'Editor',
        name: 'Senior Editor',
        username: 'editor',
        email: 'editor@bitblog.com',
        password_hash: defaultEditorHash,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: 4,
        role_id: 3,
        role_name: 'Author',
        name: 'Featured Author',
        username: 'author',
        email: 'author@bitblog.com',
        password_hash: defaultAuthorHash,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now,
      },
    ],
    categories: [
      {
        category_id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Latest innovations, computing architectures, and digital transformation.',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: 2,
        name: 'Web Development',
        slug: 'web-development',
        description: 'Modern frontend, backend architectures, APIs, and frameworks.',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: 3,
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        description: 'Generative models, LLMs, neural architectures, and intelligent systems.',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: 4,
        name: 'Design & UI/UX',
        slug: 'design-ui-ux',
        description: 'Design systems, modern aesthetics, micro-interactions, and accessibility.',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: 5,
        name: 'Business & Startups',
        slug: 'business-startups',
        description: 'Scaling digital products, entrepreneurship, and strategy.',
        created_at: now,
        updated_at: now,
      },
    ],
    tags: [
      { tag_id: 1, name: 'React', slug: 'react', created_at: now },
      { tag_id: 2, name: 'TypeScript', slug: 'typescript', created_at: now },
      { tag_id: 3, name: 'Node.js', slug: 'nodejs', created_at: now },
      { tag_id: 4, name: 'Web Dev', slug: 'web-dev', created_at: now },
      { tag_id: 5, name: 'AI', slug: 'ai', created_at: now },
      { tag_id: 6, name: 'CMS', slug: 'cms', created_at: now },
      { tag_id: 7, name: 'Design Systems', slug: 'design-systems', created_at: now },
      { tag_id: 8, name: 'Tutorial', slug: 'tutorial', created_at: now },
    ],
    posts: [
      {
        post_id: 1,
        author_id: 1,
        author_name: 'System Administrator',
        author_username: 'admin',
        category_id: 2,
        category_name: 'Web Development',
        category_slug: 'web-development',
        title: 'Building Modern Next-Gen Web Applications with React & Node.js',
        slug: 'building-modern-next-gen-web-applications',
        excerpt: 'Discover how modern component architecture, TypeScript, and clean API design power responsive digital publications.',
        content: `
          <h2>Welcome to BitBlog CMS</h2>
          <p>BitBlog is designed from the ground up for speed, elegance, and scale. With visual editing tools, rich multimedia integration, and full database persistence, content creators can compose stories effortlessly.</p>
          <div style="background-color:rgba(16,185,129,0.08);border-left:4px solid #10b981;padding:1rem 1.25rem;border-radius:6px;margin:1.5rem 0;">
            <strong style="color:#10b981;display:block;margin-bottom:0.35rem;">💡 Key Highlight</strong>
            <p style="margin:0;line-height:1.6;">Everything created in BitBlog CMS is permanently persisted and updated in real-time!</p>
          </div>
          <p>Explore the admin control panel to write new articles, moderate comments, manage tags and categories, or configure SEO and system preferences.</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        status: 'published',
        published_at: now,
        reading_time: 3,
        views_count: 124,
        comment_count: 0,
        like_count: 5,
        created_at: now,
        updated_at: now,
        tag_ids: [1, 2, 4],
      },
    ],
    comments: [],
    likes: [],
    bookmarks: [],
    notifications: [
      {
        notification_id: 1,
        user_id: 1,
        title: 'Welcome to BitBlog CMS',
        message: 'Your publication platform is online and ready with full database persistence.',
        is_read: false,
        created_at: now,
      },
    ],
    settings: {
      site_title: 'BitBlog CMS',
      site_tagline: 'Modern High-Performance Digital Publishing Platform',
      site_description: 'A modular, modern CMS and digital publication platform built with React, Vite, Node.js and TypeScript.',
      site_email: 'editorial@bitblog.com',
      site_logo: '',
      allow_registrations: 'true',
      comments_moderation: 'false',
    },
    messages: [],
    subscribers: [],
    media: [],
    seo: [],
    role_applications: [],
    audit_logs: [],
  };
};

export class Database {
  private static isInitialized = false;
  private static store: DbSchema | null = null;

  public static async initialize(): Promise<void> {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        const initialData = getDefaultSeedData();
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        this.store = initialData;
        console.log('[Database Engine] Initialized persistent data store at data/db.json');
      } else {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        try {
          this.store = JSON.parse(content);
          console.log('[Database Engine] Loaded persistent data store successfully.');
        } catch {
          const initialData = getDefaultSeedData();
          fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
          this.store = initialData;
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[Database Engine] Initialization error:', error);
      this.store = getDefaultSeedData();
      this.isInitialized = true;
    }
  }

  public static getStore(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.store = JSON.parse(content);
      } else {
        this.store = getDefaultSeedData();
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
      }
    } catch {
      if (!this.store) this.store = getDefaultSeedData();
    }
    return this.store || getDefaultSeedData();
  }

  public static saveStore(): void {
    if (!this.store) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataStr = JSON.stringify(this.store, null, 2);
      const tempFile = path.join(DATA_DIR, `db.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}`);
      fs.writeFileSync(tempFile, dataStr, 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
      } catch (fallbackErr) {
        console.error('[Database Engine] Failed to save store to disk:', fallbackErr);
      }
    }
  }

  public static async closePool(): Promise<void> {
    this.saveStore();
    this.isInitialized = false;
  }

  public static async execute<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // SQL compatibility wrapper returning empty array for direct fallback
    return [];
  }
}
