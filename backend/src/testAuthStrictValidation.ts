import { AuthService } from './services/authService';
import { UserModel } from './models/userModel';
import { hashPassword } from './utils/password';

async function runStrictAuthTests() {
  console.log('=== BITBLOG CMS — STRICT AUTH & PORTAL VALIDATION TEST SUITE ===\n');

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
    // 1. Create a designated Admin user
    console.log('--- 1. Creating Admin Account with Password ---');
    const oldPassword = 'OldInitialPassword123!';
    const oldHash = await hashPassword(oldPassword);
    const testAdmin = await UserModel.createUser({
      roleId: 1, // Admin role
      name: 'Strict Admin Test',
      username: 'strictadmin_' + Date.now(),
      email: `strictadmin_${Date.now()}@bitblog.com`,
      passwordHash: oldHash,
    });

    assert(testAdmin.role_name === 'Admin', 'User created with Admin role');

    // 2. Login with initial password
    console.log('\n--- 2. Login with Initial Password ---');
    const login1 = await AuthService.login({
      email: testAdmin.email,
      password: oldPassword,
      accountType: 'Admin',
    });

    assert(login1.token !== undefined, 'Login succeeded with initial password');
    assert(login1.user.role === 'Admin', 'Logged in user role is strictly Admin');

    // 3. User changes their password
    console.log('\n--- 3. User Changes Password to New Password ---');
    const newPassword = 'NewStrictlyChangedPass456!';
    const newHash = await hashPassword(newPassword);
    await UserModel.updatePassword(testAdmin.user_id, newHash);

    // 4. Attempt login with OLD password -> MUST FAIL
    console.log('\n--- 4. Attempting Login with OLD Password (Must Fail) ---');
    let oldLoginFailed = false;
    try {
      await AuthService.login({
        email: testAdmin.email,
        password: oldPassword,
        accountType: 'Admin',
      });
    } catch (err: any) {
      oldLoginFailed = true;
      assert(err.statusCode === 401, 'Old password rejected with HTTP 401 Unauthorized');
    }
    assert(oldLoginFailed === true, 'Login with old password strictly failed');

    // 5. Attempt login with NEW password -> MUST SUCCEED with correct Admin role
    console.log('\n--- 5. Attempting Login with NEW Password (Must Succeed) ---');
    const login2 = await AuthService.login({
      email: testAdmin.email,
      password: newPassword,
      accountType: 'Admin',
    });

    assert(login2.token !== undefined, 'Login succeeded with new password');
    assert(login2.user.role === 'Admin', 'Role in new session is strictly Admin (portal matches database)');

    // 6. Attempt login with wrong role mode (e.g. normal user trying to login in Admin mode)
    console.log('\n--- 6. Regular User Role-Guard Mismatch Check ---');
    const regularUser = await UserModel.createUser({
      roleId: 4, // User role
      name: 'Regular Reader',
      username: 'regreader_' + Date.now(),
      email: `regreader_${Date.now()}@example.com`,
      passwordHash: await hashPassword('UserPass123!'),
    });

    let roleMismatchCaught = false;
    try {
      await AuthService.login({
        email: regularUser.email,
        password: 'UserPass123!',
        accountType: 'Admin', // User selecting Admin portal mode with non-admin account
      });
    } catch (err: any) {
      roleMismatchCaught = true;
      assert(err.statusCode === 403, 'Non-admin rejected from Admin portal mode with HTTP 403 Forbidden');
    }
    assert(roleMismatchCaught === true, 'Portal accountType mismatch was strictly blocked');

    console.log(`\n===============================================================`);
    console.log(`STRICT AUTH VALIDATION TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runStrictAuthTests();
