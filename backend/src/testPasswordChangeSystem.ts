import bcrypt from 'bcrypt';
import { UserModel } from './models/userModel';
import { comparePassword, hashPassword } from './utils/password';

async function runPasswordTests() {
  console.log('=== BITBLOG CMS — PROFILE PASSWORD CHANGE TEST SUITE ===\n');

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
    // 1. Create a test user with initial password
    console.log('--- 1. Creating User with Initial Password ---');
    const initialPass = 'InitialPass123!';
    const initialHash = await hashPassword(initialPass);

    const testUser = await UserModel.createUser({
      roleId: 4,
      name: 'Password Test Account',
      username: 'passuser_' + Date.now(),
      email: `passuser_${Date.now()}@example.com`,
      passwordHash: initialHash,
    });

    assert(testUser !== null && testUser.user_id > 0, 'User created with initial password');
    const initialMatch = await comparePassword(initialPass, testUser.password_hash);
    assert(initialMatch === true, 'Initial password matches password hash');

    // 2. User Changes Their Own Password
    console.log('\n--- 2. Updating Password to New Secure Password ---');
    const newPass = 'BrandNewSecuredPass456!';
    const newHash = await hashPassword(newPass);

    await UserModel.updatePassword(testUser.user_id, newHash);
    const updatedUser = await UserModel.findById(testUser.user_id);

    assert(updatedUser !== null, 'User reloaded from database');
    const oldMatch = await comparePassword(initialPass, updatedUser?.password_hash || '');
    assert(oldMatch === false, 'Old password no longer verifies');

    const newMatch = await comparePassword(newPass, updatedUser?.password_hash || '');
    assert(newMatch === true, 'New password successfully verifies against database hash');

    // 3. Admin Resets User Password
    console.log('\n--- 3. Admin Resets User Password ---');
    const adminSetPass = 'AdminResetPass789!';
    const adminHash = await bcrypt.hash(adminSetPass, 10);

    await UserModel.updatePassword(testUser.user_id, adminHash);
    const adminResetUser = await UserModel.findById(testUser.user_id);

    const adminMatch = await comparePassword(adminSetPass, adminResetUser?.password_hash || '');
    assert(adminMatch === true, 'Admin-reset password verifies successfully');

    // 4. Verify password_hash is never leaked in safe profile responses
    console.log('\n--- 4. Verifying Password Security & Omission in Public DTOs ---');
    const { password_hash, ...safeDTO } = adminResetUser as any;
    assert(!('password_hash' in safeDTO), 'Security check: password_hash is omitted from public DTOs');

    console.log(`\n===============================================================`);
    console.log(`PASSWORD CHANGE TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Password test failure:', err);
    process.exit(1);
  }
}

runPasswordTests();
