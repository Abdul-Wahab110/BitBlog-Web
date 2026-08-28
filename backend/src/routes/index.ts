import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import {
  userRoutes,
  authorRoutes,
  postRoutes,
  categoryRoutes,
  tagRoutes,
  commentRoutes,
  likeRoutes,
  bookmarkRoutes,
  mediaRoutes,
  newsletterRoutes,
  contactRoutes,
  notificationRoutes,
  analyticsRoutes,
  seoRoutes,
  settingRoutes,
  adminRoutes,
  applicationRoutes,
} from './apiRoutes';

const router = Router();

// Mount all API endpoints under /api
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/authors', authorRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/media', mediaRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/seo', seoRoutes);
router.use('/settings', settingRoutes);
router.use('/admin', adminRoutes);
router.use('/applications', applicationRoutes);

export default router;
