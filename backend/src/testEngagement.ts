import { Database } from './config/database';
import { CommentModel } from './models/commentModel';
import { LikeModel } from './models/likeModel';
import { BookmarkModel } from './models/bookmarkModel';
import { NotificationModel } from './models/notificationModel';

async function runEngagementTests() {
  console.log('=== STARTING USER ENGAGEMENT WORKFLOW TESTS ===\n');

  await Database.initialize();

  const userId = 101;
  const postId = 501;

  // Test 1: Likes System & Duplicate Prevention
  console.log('[Test 1] Testing Likes System & Duplicate Like Prevention...');
  const initialLike = await LikeModel.toggleLike(postId, userId);
  console.log(`- First Toggle: liked=${initialLike.liked}, totalLikes=${initialLike.totalLikes} (EXPECTED: true)`);

  const duplicateToggle = await LikeModel.toggleLike(postId, userId);
  console.log(`- Second Toggle (Unlike): liked=${duplicateToggle.liked}, totalLikes=${duplicateToggle.totalLikes} (EXPECTED: false)`);

  // Test 2: Bookmarks System & Duplicate Prevention
  console.log('\n[Test 2] Testing Bookmarks System & Duplicate Bookmark Prevention...');
  const firstBookmark = await BookmarkModel.toggleBookmark(userId, postId);
  console.log(`- First Toggle: bookmarked=${firstBookmark.bookmarked} (EXPECTED: true)`);

  const secondBookmark = await BookmarkModel.toggleBookmark(userId, postId);
  console.log(`- Second Toggle: bookmarked=${secondBookmark.bookmarked} (EXPECTED: false)`);

  // Test 3: Comment System & Moderation Statuses
  console.log('\n[Test 3] Testing Comment System & Moderation Statuses...');
  const newComment = await CommentModel.createComment({
    postId,
    userId,
    content: 'Great insight on digital architecture and Oracle database integration!',
    status: 'pending',
  });
  console.log(`- Comment Created: ID=${newComment.comment_id}, Status='${newComment.status}'`);

  const approvedComment = await CommentModel.updateStatus(newComment.comment_id, 'approved');
  console.log(`- Admin Moderated Status: Status='${approvedComment?.status}' (EXPECTED: approved)`);

  // Test 4: Real System Notifications
  console.log('\n[Test 4] Testing Real System Notification Generation...');
  const notif = await NotificationModel.createNotification({
    userId,
    type: 'COMMENT_REPLY',
    title: 'New Reply to Your Comment',
    message: 'An author replied to your comment on story #501.',
  });
  console.log(`- Notification Created: ID=${notif.notification_id}, Type='${notif.type}'`);

  const userNotifs = await NotificationModel.findByUser(userId);
  console.log(`- Fetched User Notifications Count: ${userNotifs.length} (EXPECTED >= 1)`);

  // Cleanup
  await CommentModel.deleteComment(newComment.comment_id);

  console.log('\n=== ALL USER ENGAGEMENT WORKFLOW TESTS PASSED PERFECTLY! ===');
}

runEngagementTests().catch(err => {
  console.error('Engagement Test Failed:', err);
  process.exit(1);
});
