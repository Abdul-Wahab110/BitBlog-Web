import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.get('/bookmarks', authenticate, UserController.getBookmarks);

export default router;
