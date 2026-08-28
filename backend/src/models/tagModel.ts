import { Database } from '../config/database';

export interface TagRecord {
  tag_id: number;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
}

export class TagModel {
  public static async findAll(search?: string): Promise<TagRecord[]> {
    const store = Database.getStore();
    let list = [...store.tags];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
    }

    list.sort((a, b) => a.name.localeCompare(b.name));

    return list.map(t => {
      const count = store.posts.filter(p => p.tag_ids?.includes(t.tag_id) && p.status === 'published').length;
      return {
        ...t,
        post_count: count,
      };
    });
  }

  public static async findBySlug(slug: string): Promise<TagRecord | null> {
    const store = Database.getStore();
    const tag = store.tags.find(t => t.slug.toLowerCase() === slug.trim().toLowerCase());
    if (!tag) return null;

    const count = store.posts.filter(p => p.tag_ids?.includes(tag.tag_id) && p.status === 'published').length;
    return {
      ...tag,
      post_count: count,
    };
  }

  public static async findById(id: number): Promise<TagRecord | null> {
    const store = Database.getStore();
    const tag = store.tags.find(t => t.tag_id === id);
    if (!tag) return null;
    return { ...tag };
  }

  public static async createTag(name: string, slug: string): Promise<TagRecord> {
    const store = Database.getStore();
    const now = new Date().toISOString();
    const maxId = store.tags.reduce((max, t) => Math.max(max, t.tag_id), 0);
    const newId = maxId + 1;

    const record: TagRecord = {
      tag_id: newId,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      created_at: now,
      post_count: 0,
    };

    store.tags.push(record);
    Database.saveStore();
    return record;
  }

  public static async updateTag(id: number, name: string, slug: string): Promise<TagRecord | null> {
    const store = Database.getStore();
    const tag = store.tags.find(t => t.tag_id === id);
    if (!tag) return null;

    tag.name = name.trim();
    tag.slug = slug.trim().toLowerCase();
    Database.saveStore();
    return { ...tag };
  }

  public static async deleteTag(id: number): Promise<boolean> {
    const store = Database.getStore();
    store.tags = store.tags.filter(t => t.tag_id !== id);
    store.posts.forEach(p => {
      if (p.tag_ids) {
        p.tag_ids = p.tag_ids.filter(tid => tid !== id);
      }
    });
    Database.saveStore();
    return true;
  }
}
