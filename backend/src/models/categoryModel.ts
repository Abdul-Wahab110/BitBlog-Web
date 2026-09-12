import { Database } from '../config/database';

export interface CategoryRecord {
  category_id: number;
  parent_category_id?: number;
  parent_id?: number;
  parent_category_name?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

export class CategoryModel {
  public static async findAll(search?: string): Promise<CategoryRecord[]> {
    const store = Database.getStore();
    let list = [...store.categories];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }

    list.sort((a, b) => a.name.localeCompare(b.name));

    return list.map(c => {
      const postCount = store.posts.filter(p => p.category_id === c.category_id && p.status === 'published').length;
      const parentId = c.parent_category_id || c.parent_id;
      const parent = parentId ? store.categories.find(pc => pc.category_id === parentId) : undefined;
      const finalImage = c.image || c.image_url;
      return {
        ...c,
        parent_category_id: parentId,
        parent_id: parentId,
        parent_category_name: parent?.name,
        image: finalImage,
        image_url: finalImage,
        post_count: postCount,
      };
    });
  }

  public static async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const store = Database.getStore();
    const cat = store.categories.find(c => c.slug.toLowerCase() === slug.trim().toLowerCase());
    if (!cat) return null;

    const postCount = store.posts.filter(p => p.category_id === cat.category_id && p.status === 'published').length;
    const parentId = cat.parent_category_id || cat.parent_id;
    const parent = parentId ? store.categories.find(pc => pc.category_id === parentId) : undefined;
    const finalImage = cat.image || cat.image_url;

    return {
      ...cat,
      parent_category_id: parentId,
      parent_id: parentId,
      parent_category_name: parent?.name,
      image: finalImage,
      image_url: finalImage,
      post_count: postCount,
    };
  }

  public static async findById(id: number): Promise<CategoryRecord | null> {
    const store = Database.getStore();
    const cat = store.categories.find(c => c.category_id === id);
    if (!cat) return null;
    const finalImage = cat.image || cat.image_url;
    const parentId = cat.parent_category_id || cat.parent_id;
    return {
      ...cat,
      image: finalImage,
      image_url: finalImage,
      parent_category_id: parentId,
      parent_id: parentId,
    };
  }

  public static async createCategory(data: {
    parentCategoryId?: number;
    parent_id?: number;
    parent_category_id?: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    image_url?: string;
    image?: string;
  }): Promise<CategoryRecord> {
    const store = Database.getStore();
    const now = new Date().toISOString();
    const maxId = store.categories.reduce((max, c) => Math.max(max, c.category_id), 0);
    const newId = maxId + 1;
    const finalImage = data.image || data.imageUrl || data.image_url || undefined;
    const parentId = data.parentCategoryId ?? data.parent_category_id ?? data.parent_id;

    const record: CategoryRecord = {
      category_id: newId,
      parent_category_id: parentId,
      parent_id: parentId,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description,
      image: finalImage,
      image_url: finalImage,
      created_at: now,
      updated_at: now,
      post_count: 0,
    };

    store.categories.push(record);
    Database.saveStore();

    try {
      const sql = `INSERT INTO categories (name, slug, description, image, parent_id) VALUES (:1, :2, :3, :4, :5)`;
      await Database.execute(sql, [record.name, record.slug, record.description || null, record.image || null, record.parent_id || null]);
    } catch (e) {
      console.warn('Oracle category insert notice:', e);
    }

    return record;
  }

  public static async updateCategory(
    id: number,
    data: {
      parentCategoryId?: number | null;
      parent_category_id?: number | null;
      parent_id?: number | null;
      name?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
      image_url?: string | null;
      image?: string | null;
    }
  ): Promise<CategoryRecord | null> {
    const store = Database.getStore();
    const cat = store.categories.find(c => c.category_id === id);
    if (!cat) return null;

    if (data.name !== undefined) cat.name = data.name ? data.name.trim() : cat.name;
    if (data.slug !== undefined) cat.slug = data.slug ? data.slug.trim().toLowerCase() : cat.slug;
    if (data.description !== undefined) cat.description = data.description || undefined;

    if (data.image !== undefined) {
      const finalImg = data.image || undefined;
      cat.image = finalImg;
      cat.image_url = finalImg;
    } else if (data.image_url !== undefined) {
      const finalImg = data.image_url || undefined;
      cat.image = finalImg;
      cat.image_url = finalImg;
    } else if (data.imageUrl !== undefined) {
      const finalImg = data.imageUrl || undefined;
      cat.image = finalImg;
      cat.image_url = finalImg;
    }

    if (data.parentCategoryId !== undefined) {
      const pId = data.parentCategoryId || undefined;
      cat.parent_category_id = pId;
      cat.parent_id = pId;
    } else if (data.parent_category_id !== undefined) {
      const pId = data.parent_category_id || undefined;
      cat.parent_category_id = pId;
      cat.parent_id = pId;
    } else if (data.parent_id !== undefined) {
      const pId = data.parent_id || undefined;
      cat.parent_category_id = pId;
      cat.parent_id = pId;
    }

    cat.updated_at = new Date().toISOString();

    store.posts.forEach(p => {
      if (p.category_id === id) {
        if (data.name) p.category_name = data.name;
        if (data.slug) p.category_slug = data.slug;
      }
    });

    Database.saveStore();

    try {
      const sql = `UPDATE categories SET name = :1, slug = :2, description = :3, image = :4, parent_id = :5, updated_at = CURRENT_TIMESTAMP WHERE category_id = :6`;
      await Database.execute(sql, [cat.name, cat.slug, cat.description || null, cat.image || null, cat.parent_id || null, id]);
    } catch (e) {
      console.warn('Oracle category update notice:', e);
    }

    return { ...cat };
  }

  public static async deleteCategory(id: number): Promise<boolean> {
    const store = Database.getStore();
    store.categories = store.categories.filter(c => c.category_id !== id);

    store.posts.forEach(p => {
      if (p.category_id === id) {
        p.category_id = undefined;
        p.category_name = 'General';
        p.category_slug = 'general';
      }
    });

    Database.saveStore();

    try {
      await Database.execute(`UPDATE posts SET category_id = NULL WHERE category_id = :1`, [id]);
      await Database.execute(`DELETE FROM categories WHERE category_id = :1`, [id]);
    } catch (e) {
      console.warn('Oracle category delete notice:', e);
    }

    return true;
  }
}

