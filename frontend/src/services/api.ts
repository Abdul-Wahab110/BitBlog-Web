const API_BASE_URL = '/api';

export class ApiService {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('modernblog_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    }
    if (!response.ok) {
      if (response.status === 404 || response.status === 502 || response.status === 504) {
        throw new Error(`API server unreachable (${response.status}). Please ensure the backend is running.`);
      }
      throw new Error(`HTTP error ${response.status}`);
    }
    return { success: true };
  }

  // Articles Endpoints (Public)
  public static async getPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    author?: string;
    search?: string;
    sort?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.category) params.append('category', options.category);
    if (options.tag) params.append('tag', options.tag);
    if (options.author) params.append('author', options.author);
    if (options.search) params.append('search', options.search);
    if (options.sort) params.append('sort', options.sort);

    const res = await fetch(`${API_BASE_URL}/posts?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getFeaturedPosts() {
    const res = await fetch(`${API_BASE_URL}/posts/featured`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getPostBySlug(slug: string) {
    const res = await fetch(`${API_BASE_URL}/posts/${encodeURIComponent(slug)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Categories Endpoints
  public static async getCategories(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE_URL}/categories${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getCategoryBySlug(slug: string) {
    const res = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(slug)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createCategory(data: any) {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateCategory(id: number, data: any) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async deleteCategory(id: number) {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Tags Endpoints
  public static async getTags(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE_URL}/tags${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getTagBySlug(slug: string) {
    const res = await fetch(`${API_BASE_URL}/tags/${encodeURIComponent(slug)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createTag(data: { name: string; slug?: string }) {
    const res = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateTag(id: number, data: { name: string; slug?: string }) {
    const res = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async deleteTag(id: number) {
    const res = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Engagement Endpoints
  public static async getPostComments(postId: number) {
    const res = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getUserComments() {
    const res = await fetch(`${API_BASE_URL}/comments/user`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createComment(data: { postId: number; parentCommentId?: number; content: string }) {
    const res = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateComment(id: number, content: string) {
    const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse(res);
  }

  public static async deleteComment(id: number) {
    const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async toggleLike(postId: number) {
    const res = await fetch(`${API_BASE_URL}/likes/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ postId }),
    });
    return this.handleResponse(res);
  }

  public static async getUserBookmarks() {
    const res = await fetch(`${API_BASE_URL}/bookmarks`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async toggleBookmark(postId: number) {
    const res = await fetch(`${API_BASE_URL}/bookmarks/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ postId }),
    });
    return this.handleResponse(res);
  }

  public static async getUserNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async markNotificationRead(id: number) {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // SEO & AEO/GEO Endpoints
  public static async getSeoByPost(postId: number) {
    const res = await fetch(`${API_BASE_URL}/seo/${postId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getSeoByPage(pageIdentifier: string) {
    const res = await fetch(`${API_BASE_URL}/seo/page/${encodeURIComponent(pageIdentifier)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async upsertSeoByPost(postId: number, data: any) {
    const res = await fetch(`${API_BASE_URL}/seo/${postId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async analyzeSeo(data: any) {
    const res = await fetch(`${API_BASE_URL}/seo/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  // Newsletter Endpoints
  public static async subscribeNewsletter(payload: string | { email: string; name?: string; topics?: string[] }) {
    const body = typeof payload === 'string' ? { email: payload } : payload;
    const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  public static async getNewsletterSubscribers(options: { search?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.status) params.append('status', options.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/newsletter${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createNewsletterSubscriber(data: {
    email: string;
    name?: string;
    status?: string;
    topics?: string[];
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateNewsletterSubscriber(id: number, data: {
    email?: string;
    name?: string;
    status?: string;
    topics?: string[];
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateNewsletterSubscriberStatus(id: number, status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING' | 'REJECTED') {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(res);
  }

  public static async approveNewsletterSubscriber(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter/${id}/approve`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async rejectNewsletterSubscriber(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter/${id}/reject`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async deleteNewsletterSubscriber(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/newsletter/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Contact Endpoints
  public static async getContactMessages() {
    const res = await fetch(`${API_BASE_URL}/admin/messages`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Settings Endpoints
  public static async getSettings() {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async updateSettings(settingsData: any) {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settingsData),
    });
    return this.handleResponse(res);
  }

  // Privacy-Aware View Tracker Endpoint
  public static async recordView(postId: number) {
    const res = await fetch(`${API_BASE_URL}/analytics/record`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ postId }),
    });
    return this.handleResponse(res);
  }

  // User Article Submissions Endpoints
  public static async getUserArticles() {
    const res = await fetch(`${API_BASE_URL}/users/articles`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createUserArticle(data: any) {
    const res = await fetch(`${API_BASE_URL}/users/articles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async getUserArticleById(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/articles/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async updateUserArticle(id: number, data: any) {
    const res = await fetch(`${API_BASE_URL}/users/articles/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async deleteUserArticle(id: number) {
    const res = await fetch(`${API_BASE_URL}/users/articles/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Admin CMS Endpoints
  public static async getAdminDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getAdminPosts() {
    const res = await fetch(`${API_BASE_URL}/admin/posts`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getPendingPosts() {
    const res = await fetch(`${API_BASE_URL}/admin/posts/pending`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async approvePost(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/approve`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async rejectPost(id: number, reason?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/reject`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(res);
  }

  public static async requestChangesPost(id: number, feedback: string) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}/request-changes`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ feedback }),
    });
    return this.handleResponse(res);
  }

  public static async getPostById(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createPost(data: any) {
    const res = await fetch(`${API_BASE_URL}/admin/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updatePost(id: number, data: any) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async deletePost(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async createAdminUser(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
    status?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(res);
  }

  public static async updateUserRole(id: number, role: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse(res);
  }

  public static async updateUserStatus(id: number, status: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(res);
  }

  public static async deleteUser(id: number) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getUserProfile() {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async updateUserProfile(data: {
    name?: string;
    bio?: string;
    profile_image?: string;
    website?: string;
    author_tags?: string[];
    social_links?: any;
    short_description?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async updateUserPassword(data: { currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('modernblog_token');
    const res = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return this.handleResponse(res);
  }

  public static async getAuthors() {
    const res = await fetch(`${API_BASE_URL}/authors`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getAuthorById(idOrUsername: string | number) {
    const res = await fetch(`${API_BASE_URL}/authors/${idOrUsername}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async updateAdminUserProfile(id: number, data: any) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async getAdminAuthors() {
    const res = await fetch(`${API_BASE_URL}/admin/authors`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // Role Applications API (Reader Apply & Admin Review)
  public static async applyRole(data: {
    roleApplied: 'Author' | 'Editor';
    bio: string;
    sampleUrls?: string;
    topics?: string[];
    motivation: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/applications/apply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async getMyApplication() {
    const res = await fetch(`${API_BASE_URL}/applications/my`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async getAdminApplications(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/applications${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async reviewAdminApplication(id: number, status: 'approved' | 'rejected', feedback?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/applications/${id}/review`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, feedback }),
    });
    return this.handleResponse(res);
  }

  // Admin System Audit Trail API
  public static async getAuditLogs(params?: { category?: string; severity?: string; search?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
    if (params?.severity && params.severity !== 'all') searchParams.append('severity', params.severity);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/admin/audit-logs${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  public static async clearAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs/clear`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // 6-Digit Registration OTP Verification API
  public static async sendRegistrationOtp(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/send-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async verifyRegistrationOtp(data: {
    email: string;
    otp: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  public static async resendRegistrationOtp(email: string) {
    const res = await fetch(`${API_BASE_URL}/auth/resend-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(res);
  }
}
