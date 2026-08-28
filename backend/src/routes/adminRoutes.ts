import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { PostController } from '../controllers/postController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAuthor, requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Protect all admin endpoints with auth + role guards
router.use(authenticate, requireAuthor);

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/stats', AdminController.getDashboardStats);
router.get('/posts', PostController.getAdminPosts);
router.get('/users', requireAdmin, AdminController.getUsers);
router.post('/users', requireAdmin, AdminController.createUser);
router.put('/users/:id/role', requireAdmin, AdminController.updateUserRole);
router.put('/users/:id/status', requireAdmin, AdminController.updateUserStatus);
router.delete('/users/:id', requireAdmin, AdminController.deleteUser);
router.get('/authors', AdminController.getAuthors);
router.get('/newsletter', AdminController.getNewsletterSubscribers);
router.get('/messages', AdminController.getContactMessages);
router.get('/overview', requireAdmin, AdminController.getSystemOverview);

export default router;
