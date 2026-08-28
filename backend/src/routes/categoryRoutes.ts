import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate } from '../middleware/authMiddleware';
import { requireEditor } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', CategoryController.getCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);
router.post('/', authenticate, requireEditor, CategoryController.createCategory);
router.put('/:id', authenticate, requireEditor, CategoryController.updateCategory);
router.delete('/:id', authenticate, requireEditor, CategoryController.deleteCategory);

export default router;
