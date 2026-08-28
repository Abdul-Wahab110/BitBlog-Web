import { PostService } from './services/postService';
import { UserModel } from './models/userModel';
import { hashPassword } from './utils/password';
import { JwtPayload } from './types';

async function testAuthorEditorPermissions() {
  console.log('=== TESTING AUTHOR & EDITOR ARTICLE AUTHORING PERMISSIONS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string) {
    if (cond) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Test Author Role can create Article
    const authorUser = await UserModel.createUser({
      roleId: 3, // Role: Author
      name: 'Verified Staff Author',
      username: 'author_staff_' + Date.now(),
      email: `author_staff_${Date.now()}@bitblog.com`,
      passwordHash: await hashPassword('AuthorPass123!'),
    });

    const authorJwt: JwtPayload = {
      userId: authorUser.user_id,
      email: authorUser.email,
      username: authorUser.username,
      role: 'Author',
      name: authorUser.name,
    };

    const authorPost = await PostService.createPost(authorJwt, {
      title: 'Author Exclusive Article ' + Date.now(),
      content: 'Content authored by verified author.',
      status: 'draft',
    });

    assert(authorPost !== null && authorPost.post_id > 0, 'Author can create & draft articles');

    // 2. Test Editor Role can create & publish Article
    const editorUser = await UserModel.createUser({
      roleId: 2, // Role: Editor
      name: 'Verified Staff Editor',
      username: 'editor_staff_' + Date.now(),
      email: `editor_staff_${Date.now()}@bitblog.com`,
      passwordHash: await hashPassword('EditorPass123!'),
    });

    const editorJwt: JwtPayload = {
      userId: editorUser.user_id,
      email: editorUser.email,
      username: editorUser.username,
      role: 'Editor',
      name: editorUser.name,
    };

    const editorPost = await PostService.createPost(editorJwt, {
      title: 'Editor Verified Story ' + Date.now(),
      content: 'Content created and reviewed by staff editor.',
      status: 'published',
    });

    assert(editorPost !== null && editorPost.post_id > 0, 'Editor can create & publish articles');

    // 3. Test Reader Role is still strictly blocked
    const readerUser = await UserModel.createUser({
      roleId: 4, // Role: User (Reader)
      name: 'Standard Reader',
      username: 'reader_guest_' + Date.now(),
      email: `reader_guest_${Date.now()}@example.com`,
      passwordHash: await hashPassword('ReaderPass123!'),
    });

    const readerJwt: JwtPayload = {
      userId: readerUser.user_id,
      email: readerUser.email,
      username: readerUser.username,
      role: 'User',
      name: readerUser.name,
    };

    let readerBlocked = false;
    try {
      await PostService.createPost(readerJwt, {
        title: 'Reader Post Attempt',
        content: 'Should be blocked.',
      });
    } catch (err: any) {
      readerBlocked = true;
      assert(err.statusCode === 403, 'Reader article authoring blocked with HTTP 403');
    }
    assert(readerBlocked, 'Reader is strictly prevented from writing articles');

    console.log(`\n===============================================================`);
    console.log(`AUTHOR & EDITOR PERMISSIONS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

testAuthorEditorPermissions();
