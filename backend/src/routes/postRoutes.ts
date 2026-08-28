import { Router } from 'express';
import { PostController } from '../controllers/postController';

const router = Router();

router.get('/', PostController.getPosts);
router.get('/featured', PostController.getFeaturedPosts);
router.get('/:slug', PostController.getPostBySlug);

export default router;
