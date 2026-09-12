import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/categoryModel';
import { ResponseUtil } from '../utils/apiResponse';
import { generateSlug } from '../utils/slug';

export class CategoryController {
  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const categories = await CategoryModel.findAll(search);
      ResponseUtil.success(res, categories, 'Categories list retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await CategoryModel.findBySlug(slug);
      if (!category) {
        ResponseUtil.error(res, `Category '${slug}' not found`, 404);
        return;
      }
      ResponseUtil.success(res, category, 'Category details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, description, image, imageUrl, image_url, parentCategoryId, parent_category_id, parent_id } = req.body;
      if (!name || name.trim().length < 2) {
        ResponseUtil.error(res, 'Category name must be at least 2 characters long', 400);
        return;
      }
      const finalSlug = slug ? generateSlug(slug) : generateSlug(name);
      const finalImage = image || imageUrl || image_url;
      const parentId = parentCategoryId || parent_category_id || parent_id;

      const newCategory = await CategoryModel.createCategory({
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || undefined,
        image: finalImage?.trim() || undefined,
        parent_id: parentId ? parseInt(String(parentId)) : undefined,
      });
      ResponseUtil.success(res, newCategory, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, slug, description, image, imageUrl, image_url, parentCategoryId, parent_category_id, parent_id } = req.body;
      const finalImage = image !== undefined ? image : (imageUrl !== undefined ? imageUrl : image_url);
      const parentId = parentCategoryId !== undefined ? parentCategoryId : (parent_category_id !== undefined ? parent_category_id : parent_id);

      const updated = await CategoryModel.updateCategory(id, {
        name: name ? name.trim() : undefined,
        slug: slug ? generateSlug(slug) : undefined,
        description: description !== undefined ? description.trim() : undefined,
        image: finalImage !== undefined ? (finalImage ? finalImage.trim() : null) : undefined,
        parent_id: parentId !== undefined ? (parentId ? parseInt(String(parentId)) : null) : undefined,
      });

      if (!updated) {
        ResponseUtil.error(res, `Category #${id} not found`, 404);
        return;
      }
      ResponseUtil.success(res, updated, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await CategoryModel.deleteCategory(id);
      ResponseUtil.success(res, null, `Category #${id} deleted successfully. Associated articles preserved.`);
    } catch (error) {
      next(error);
    }
  }
}

