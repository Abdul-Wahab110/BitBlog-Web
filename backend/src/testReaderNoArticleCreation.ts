import { PostService } from './services/postService';
import { UserModel } from './models/userModel';
import { hashPassword } from './utils/password';
import { JwtPayload } from './types';

async function runReaderNoArticleTests() {
  console.log('=== BITBLOG CMS — READER NO ARTICLE AUTHORING TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Create a Standard Reader / User
    console.log('--- 1. Testing Standard Reader Article Creation Prevention ---');
    const readerUser = await UserModel.createUser({
      roleId: 4, // Role: User (Reader)
      name: 'Test Reader Member',
      username: 'reader_' + Date.now(),
      email: `reader_${Date.now()}@example.com`,
      passwordHash: await hashPassword('ReaderPassword123!'),
    });

    const readerJwt: JwtPayload = {
      userId: readerUser.user_id,
      email: readerUser.email,
      username: readerUser.username,
      role: 'User',
      name: readerUser.name,
    };

    // Reader attempts to create an article
    let readerBlocked = false;
    try {
      await PostService.createPost(readerJwt, {
        title: 'Attempted Reader Article',
        content: 'This should be strictly blocked by the system.',
      });
    } catch (err: any) {
      readerBlocked = true;
      assert(err.statusCode === 403, 'Reader article creation blocked with HTTP 403 Forbidden');
    }
    assert(readerBlocked === true, 'System strictly prevented standard reader from creating an article');

    // 2. Testing Staff Author (Role: Author) can create articles
    console.log('\n--- 2. Testing Staff Author Article Creation Allowed ---');
    const authorUser = await UserModel.createUser({
      roleId: 3, // Role: Author
      name: 'Editorial Staff Author',
      username: 'author_' + Date.now(),
      email: `author_${Date.now()}@bitblog.com`,
      passwordHash: await hashPassword('AuthorPassword123!'),
    });

    const authorJwt: JwtPayload = {
      userId: authorUser.user_id,
      email: authorUser.email,
      username: authorUser.username,
      role: 'Author',
      name: authorUser.name,
    };

    const newAuthorPost = await PostService.createPost(authorJwt, {
      title: 'Valid Author Story ' + Date.now(),
      content: 'This is a genuine article written by editorial staff member.',
      status: 'draft',
    });

    assert(newAuthorPost !== null && newAuthorPost.post_id > 0, 'Staff Author can create articles successfully');
    assert(newAuthorPost.author_id === authorUser.user_id, 'Article author_id correctly assigned to Staff Author');

    console.log(`\n===============================================================`);
    console.log(`READER NO ARTICLE TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runReaderNoArticleTests();
