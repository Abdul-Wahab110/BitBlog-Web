# BitBlog CMS API Route Specifications

Base API Path: `/api/v1`

## Authentication & Account (`/api/v1/auth`)
- `POST /auth/register` - Create new reader account
- `POST /auth/login` - Authenticate user & return JWT token
- `POST /auth/forgot-password` - Request password reset token
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user profile (Authenticated)

## Public Post Routes (`/api/v1/posts`)
- `GET /posts` - List published posts with pagination & filtering
- `GET /posts/featured` - List featured posts
- `GET /posts/latest` - List latest breaking posts
- `GET /posts/:slug` - Fetch single article by slug
- `GET /posts/:slug/related` - Get related posts

## Public Category & Tag Routes
- `GET /categories` - List categories
- `GET /categories/:slug` - Get category with posts
- `GET /tags` - List tags
- `GET /tags/:slug` - Get tag with posts

## Interactive User Routes (`/api/v1/user`)
- `GET /user/profile` - User profile
- `PUT /user/profile` - Update user profile
- `GET /user/bookmarks` - User saved articles
- `POST /user/bookmarks/:postId` - Toggle bookmark
- `GET /user/comments` - User's published comments

## WordPress-Inspired Admin CMS Routes (`/api/v1/admin`)
*(Protected by Admin / Editor / Author Role Middlewares)*
- `GET /admin/dashboard/stats` - Total posts, users, comments, views (Returns 0 on empty DB)
- `GET /admin/posts` - Manage all posts (All statuses)
- `POST /admin/posts` - Create post (Draft / Schedule / Publish)
- `PUT /admin/posts/:id` - Update post
- `DELETE /admin/posts/:id` - Delete post
- `GET /admin/categories` - Manage categories
- `POST /admin/categories` - Create category
- `GET /admin/tags` - Manage tags
- `POST /admin/tags` - Create tag
- `GET /admin/comments` - Moderation queue
- `PUT /admin/comments/:id/approve` - Approve comment
- `DELETE /admin/comments/:id` - Delete comment
- `GET /admin/users` - Manage user accounts & roles
- `PUT /admin/users/:id/role` - Change user role
