import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { CategoryController } from '../controllers/categoryController';
import { CommentController } from '../controllers/commentController';
import {
  UserController,
  TagController,
  LikeController,
  BookmarkController,
  NewsletterController,
  ContactController,
  NotificationController,
  AnalyticsController,
  SeoController,
  SettingController,
  SitemapController,
  RobotsController,
} from '../controllers/apiControllers';
import { MediaController } from '../controllers/mediaController';
import { AdminController } from '../controllers/adminController';
import { ApplicationController } from '../controllers/applicationController';
import { AuditController } from '../controllers/auditController';
import { authenticate } from '../middleware/authMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import {
  requireAdmin,
  requireEditor,
  requireAuthor,
  requireAuthenticated,
} from '../middleware/roleMiddleware';

// Users Router (Profile + Reader Article Submissions)
export const userRoutes = Router();
userRoutes.get('/', authenticate, requireEditor, UserController.getUsers);
userRoutes.get('/profile', authenticate, requireAuthenticated, UserController.getProfile);
userRoutes.put('/profile', authenticate, requireAuthenticated, UserController.updateProfile);
userRoutes.put('/password', authenticate, requireAuthenticated, UserController.updatePassword);
userRoutes.post('/avatar', authenticate, requireAuthenticated, uploadMiddleware.single('file'), UserController.uploadAvatar);
userRoutes.get('/articles', authenticate, requireAuthor, PostController.getUserArticles);
userRoutes.post('/articles', authenticate, requireAuthor, PostController.createPost);
userRoutes.get('/articles/:id', authenticate, requireAuthor, PostController.getPostById);
userRoutes.put('/articles/:id', authenticate, requireAuthor, PostController.updatePost);
userRoutes.delete('/articles/:id', authenticate, requireAuthor, PostController.deletePost);

// Public Authors Router
export const authorRoutes = Router();
authorRoutes.get('/', UserController.getPublicAuthors);
authorRoutes.get('/:idOrUsername', UserController.getPublicAuthorById);

// Posts Router (Public & Staff)
export const postRoutes = Router();
postRoutes.get('/', PostController.getPosts);
postRoutes.get('/featured', PostController.getFeaturedPosts);
postRoutes.get('/:slug', PostController.getPostBySlug);
postRoutes.post('/', authenticate, requireAuthor, PostController.createPost);
postRoutes.get('/id/:id', authenticate, requireAuthor, PostController.getPostById);
postRoutes.put('/:id', authenticate, requireAuthor, PostController.updatePost);
postRoutes.delete('/:id', authenticate, requireAuthor, PostController.deletePost);

// Categories Router (Public + Admin CRUD)
export const categoryRoutes = Router();
categoryRoutes.get('/', CategoryController.getCategories);
categoryRoutes.get('/:slug', CategoryController.getCategoryBySlug);
categoryRoutes.post('/', authenticate, requireEditor, CategoryController.createCategory);
categoryRoutes.put('/:id', authenticate, requireEditor, CategoryController.updateCategory);
categoryRoutes.delete('/:id', authenticate, requireEditor, CategoryController.deleteCategory);

// Tags Router (Public + Staff CRUD)
export const tagRoutes = Router();
tagRoutes.get('/', TagController.getTags);
tagRoutes.get('/:slug', TagController.getTagBySlug);
tagRoutes.post('/', authenticate, requireAuthor, TagController.createTag);
tagRoutes.put('/:id', authenticate, requireEditor, TagController.updateTag);
tagRoutes.delete('/:id', authenticate, requireEditor, TagController.deleteTag);

// Comments Router (Public Reading + Authenticated Actions + Admin Moderation)
export const commentRoutes = Router();
commentRoutes.get('/post/:postId', CommentController.getPostComments);
commentRoutes.get('/user', authenticate, requireAuthenticated, CommentController.getUserComments);
commentRoutes.post('/', authenticate, requireAuthenticated, CommentController.createComment);
commentRoutes.put('/:id', authenticate, requireAuthenticated, CommentController.updateComment);
commentRoutes.delete('/:id', authenticate, requireAuthenticated, CommentController.deleteComment);

// Likes Router
export const likeRoutes = Router();
likeRoutes.post('/toggle', authenticate, requireAuthenticated, LikeController.toggleLike);

// Bookmarks Router
export const bookmarkRoutes = Router();
bookmarkRoutes.get('/', authenticate, requireAuthenticated, BookmarkController.getBookmarks);
bookmarkRoutes.post('/toggle', authenticate, requireAuthenticated, BookmarkController.toggleBookmark);

// SEO Router (Public Get + Authenticated Put + Live Analysis)
export const seoRoutes = Router();
seoRoutes.post('/analyze', SeoController.analyzeSeo);
seoRoutes.get('/page/:pageIdentifier', SeoController.getSeoByPage);
seoRoutes.get('/:postId', SeoController.getSeoByPost);
seoRoutes.put('/:postId', authenticate, requireAuthor, SeoController.upsertSeoByPost);

// Newsletter Router (Public Subscribe/Unsubscribe + Admin List)
export const newsletterRoutes = Router();
newsletterRoutes.post('/subscribe', NewsletterController.subscribe);
newsletterRoutes.post('/unsubscribe', NewsletterController.unsubscribe);

// Contact Router (Public Message + Admin Inbox Actions)
export const contactRoutes = Router();
contactRoutes.post('/', ContactController.sendMessage);
contactRoutes.post('/send', ContactController.sendMessage);

// Notifications Router
export const notificationRoutes = Router();
notificationRoutes.get('/', authenticate, requireAuthenticated, NotificationController.getNotifications);
notificationRoutes.patch('/:id/read', authenticate, requireAuthenticated, NotificationController.markRead);

// Analytics Router
export const analyticsRoutes = Router();
analyticsRoutes.get('/', authenticate, requireEditor, AnalyticsController.getMetrics);
analyticsRoutes.post('/record', AnalyticsController.recordView);

// Settings Router
export const settingRoutes = Router();
settingRoutes.get('/', SettingController.getSettings);
settingRoutes.put('/', authenticate, requireEditor, SettingController.updateSettings);
settingRoutes.post('/', authenticate, requireEditor, SettingController.updateSettings);
settingRoutes.patch('/', authenticate, requireEditor, SettingController.updateSettings);

// Media Router (Upload File + Library CRUD)
export const mediaRoutes = Router();
mediaRoutes.get('/', authenticate, requireAuthor, MediaController.getMedia);
mediaRoutes.post('/upload', authenticate, requireAuthenticated, uploadMiddleware.single('file'), MediaController.uploadFile);
mediaRoutes.patch('/:id/alt', authenticate, requireAuthor, MediaController.updateAltText);
mediaRoutes.delete('/:id', authenticate, requireAuthor, MediaController.deleteMedia);

// Admin Router (Protected by Auth & Role guards)
export const adminRoutes = Router();
adminRoutes.use(authenticate, requireAuthor);

// Admin Dashboard & Article CRUD
adminRoutes.get('/dashboard/stats', AdminController.getDashboardStats);
adminRoutes.get('/posts', PostController.getAdminPosts);
adminRoutes.get('/posts/pending', requireEditor, PostController.getPendingPosts);
adminRoutes.patch('/posts/:id/approve', requireEditor, PostController.approvePost);
adminRoutes.patch('/posts/:id/reject', requireEditor, PostController.rejectPost);
adminRoutes.patch('/posts/:id/request-changes', requireEditor, PostController.requestChangesPost);
adminRoutes.post('/posts', PostController.createPost);
adminRoutes.get('/posts/:id', PostController.getPostById);
adminRoutes.put('/posts/:id', PostController.updatePost);
adminRoutes.delete('/posts/:id', PostController.deletePost);

// Admin Comment Moderation
adminRoutes.get('/comments', requireEditor, CommentController.getAdminComments);
adminRoutes.patch('/comments/:id/status', requireEditor, CommentController.updateStatus);

// Admin User Management
adminRoutes.get('/users', requireEditor, AdminController.getUsers);
adminRoutes.post('/users', requireAdmin, AdminController.createUser);
adminRoutes.patch('/users/:id/role', requireAdmin, AdminController.updateUserRole);
adminRoutes.patch('/users/:id/status', requireAdmin, AdminController.updateUserStatus);
adminRoutes.patch('/users/:id/profile', requireEditor, AdminController.updateUserProfile);
adminRoutes.delete('/users/:id', requireAdmin, AdminController.deleteUser);

// Admin Module Endpoints
adminRoutes.get('/authors', requireEditor, AdminController.getAuthors);
adminRoutes.get('/newsletter', requireEditor, NewsletterController.getAdminSubscribers);
adminRoutes.post('/newsletter', requireEditor, NewsletterController.createAdminSubscriber);
adminRoutes.put('/newsletter/:id', requireEditor, NewsletterController.updateAdminSubscriber);
adminRoutes.patch('/newsletter/:id/status', requireEditor, NewsletterController.updateAdminSubscriberStatus);
adminRoutes.patch('/newsletter/:id/approve', requireEditor, NewsletterController.approveAdminSubscriber);
adminRoutes.patch('/newsletter/:id/reject', requireEditor, NewsletterController.rejectAdminSubscriber);
adminRoutes.delete('/newsletter/:id', requireEditor, NewsletterController.deleteAdminSubscriber);
adminRoutes.get('/messages', requireEditor, ContactController.getMessages);
adminRoutes.delete('/messages/:id', requireEditor, ContactController.deleteMessage);
adminRoutes.get('/analytics', requireEditor, AnalyticsController.getMetrics);
adminRoutes.get('/overview', requireAdmin, AdminController.getSystemOverview);

// Admin Role Applications Management
adminRoutes.get('/applications', requireAdmin, ApplicationController.getAdminApplications);
adminRoutes.patch('/applications/:id/review', requireAdmin, ApplicationController.reviewApplication);

// Admin System Audit Trail
adminRoutes.get('/audit-logs', requireEditor, AuditController.getLogs);
adminRoutes.delete('/audit-logs/clear', requireAdmin, AuditController.clearLogs);

// Role Applications Router (Reader Portal)
export const applicationRoutes = Router();
applicationRoutes.post('/apply', authenticate, requireAuthenticated, ApplicationController.apply);
applicationRoutes.get('/my', authenticate, requireAuthenticated, ApplicationController.getMyApplication);

