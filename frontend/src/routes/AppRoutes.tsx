import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { UserLayout } from '../components/layout/UserLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Protected Route Guards
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// Public Pages
import { Home } from '../pages/public/Home';
import { Blog } from '../pages/public/Blog';
import { SingleArticle } from '../pages/public/SingleArticle';
import { Categories } from '../pages/public/Categories';
import { CategoryDetails } from '../pages/public/CategoryDetails';
import { Tags } from '../pages/public/Tags';
import { TagDetails } from '../pages/public/TagDetails';
import { Search } from '../pages/public/Search';
import { Authors } from '../pages/public/Authors';
import { AuthorProfile } from '../pages/public/AuthorProfile';
import { About } from '../pages/public/About';
import { ApplyContributor } from '../pages/public/ApplyContributor';
import { Contact } from '../pages/public/Contact';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { ForgotPassword } from '../pages/public/ForgotPassword';
import { ResetPassword } from '../pages/public/ResetPassword';
import { PrivacyPolicy } from '../pages/public/PrivacyPolicy';
import { Terms } from '../pages/public/Terms';
import { Disclaimer } from '../pages/public/Disclaimer';
import { NotFound } from '../pages/public/NotFound';

// User Dashboard Pages
import { UserDashboard } from '../pages/user/UserDashboard';
import { UserArticles } from '../pages/user/UserArticles';
import { UserAddArticle } from '../pages/user/UserAddArticle';
import { UserEditArticle } from '../pages/user/UserEditArticle';
import { Profile } from '../pages/user/Profile';
import { Bookmarks } from '../pages/user/Bookmarks';
import { UserComments } from '../pages/user/UserComments';
import { Notifications } from '../pages/user/Notifications';
import { UserSettings } from '../pages/user/UserSettings';
import { UserApplyRole } from '../pages/user/UserApplyRole';

// Admin CMS Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminPosts } from '../pages/admin/AdminPosts';
import { AddPost } from '../pages/admin/AddPost';
import { EditPost } from '../pages/admin/EditPost';
import { AdminDrafts } from '../pages/admin/AdminDrafts';
import { ScheduledPosts } from '../pages/admin/ScheduledPosts';
import { AdminCategories } from '../pages/admin/AdminCategories';
import { AdminTags } from '../pages/admin/AdminTags';
import { AdminComments } from '../pages/admin/AdminComments';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminAuthors } from '../pages/admin/AdminAuthors';
import { AdminApplications } from '../pages/admin/AdminApplications';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs';
import { AdminMedia } from '../pages/admin/AdminMedia';
import { AdminNewsletter } from '../pages/admin/AdminNewsletter';
import { AdminContactMessages } from '../pages/admin/AdminContactMessages';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AdminSEO } from '../pages/admin/AdminSEO';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AdminLogin } from '../pages/admin/AdminLogin';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Publication Site Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/post/:slug" element={<SingleArticle />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryDetails />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/tag/:slug" element={<TagDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/author/:id" element={<AuthorProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/apply" element={<ApplyContributor />} />
        <Route path="/apply-role" element={<ApplyContributor />} />
        <Route path="/contribute" element={<ApplyContributor />} />
        <Route path="/user/apply-role" element={<ApplyContributor />} />
        <Route path="/contact" element={<Contact />} />

        {/* Guest-only Auth Pages (redirect to dashboard if already authenticated) */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/super-admin" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/superadmin" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/superadmin-login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/admin-login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Reader User Center Routes (Protected for authenticated Users) */}
      <Route
        element={
          <ProtectedRoute requiredRole="User">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/bookmarks" element={<Bookmarks />} />
        <Route path="/user/comments" element={<UserComments />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/user/apply" element={<UserApplyRole />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/settings" element={<UserSettings />} />
      </Route>

      {/* WordPress-Inspired Admin CMS Routes (Protected for Author/Editor/Admin) */}
      <Route
        element={
          <ProtectedRoute requiredRole="Author">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/posts/new" element={<AddPost />} />
        <Route path="/admin/posts/edit/:id" element={<EditPost />} />
        <Route path="/admin/posts/:id" element={<EditPost />} />
        <Route path="/admin/posts/drafts" element={<AdminDrafts />} />
        <Route path="/admin/posts/scheduled" element={<ScheduledPosts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/tags" element={<AdminTags />} />
        <Route path="/admin/comments" element={<AdminComments />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/authors" element={<AdminAuthors />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/audit" element={<AdminAuditLogs />} />
        <Route path="/admin/media" element={<AdminMedia />} />
        <Route path="/admin/newsletter" element={<AdminNewsletter />} />
        <Route path="/admin/messages" element={<AdminContactMessages />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/seo" element={<AdminSEO />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};
