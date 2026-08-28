import { AuthService } from './services/authService';
import { UserModel } from './models/userModel';
import { hashPassword } from './utils/password';

async function runAdminSeparationTests() {
  console.log('=== BITBLOG CMS — ADMIN SEPARATE URL & GATEWAY TEST SUITE ===\n');

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
    // 1. Create Normal Reader / Simple User
    console.log('--- 1. Testing Standard User vs Admin Gateway Restriction ---');
    const simpleUser = await UserModel.createUser({
      roleId: 4, // Role: User (Simple Reader)
      name: 'Public Reader User',
      username: 'reader_' + Date.now(),
      email: `reader_${Date.now()}@example.com`,
      passwordHash: await hashPassword('ReaderPass123!'),
    });

    assert(simpleUser.role_name === 'User', 'Standard user created with Role=User');

    // Standard user tries to login via dedicated Admin Gateway (accountType = 'Admin')
    let blockedFromAdminGateway = false;
    try {
      await AuthService.login({
        email: simpleUser.email,
        password: 'ReaderPass123!',
        accountType: 'Admin',
      });
    } catch (err: any) {
      blockedFromAdminGateway = true;
      assert(err.statusCode === 403, 'Simple user blocked from Admin Gateway with HTTP 403 Forbidden');
    }
    assert(blockedFromAdminGateway === true, 'Standard user is strictly denied access to the Admin Gateway');

    // 2. Standard user can still login normally through Public Reader Login (accountType = 'User')
    console.log('\n--- 2. Testing Standard User Public Portal Access ---');
    const readerLogin = await AuthService.login({
      email: simpleUser.email,
      password: 'ReaderPass123!',
      accountType: 'User',
    });
    assert(readerLogin.token !== undefined, 'Standard user logs in successfully via public login');
    assert(readerLogin.user.role === 'User', 'Standard user role is strictly User (navigates to /user/dashboard)');

    // 3. Create Admin Staff Account
    console.log('\n--- 3. Testing Staff Access on Dedicated Admin Gateway ---');
    const adminStaff = await UserModel.createUser({
      roleId: 1, // Role: Admin
      name: 'Admin Gateway Staff',
      username: 'staffadmin_' + Date.now(),
      email: `staffadmin_${Date.now()}@bitblog.com`,
      passwordHash: await hashPassword('StaffSecurityPass123!'),
    });

    const staffLogin = await AuthService.login({
      email: adminStaff.email,
      password: 'StaffSecurityPass123!',
      accountType: 'Admin',
    });

    assert(staffLogin.token !== undefined, 'Staff member authenticates successfully on Admin Gateway');
    assert(staffLogin.user.role === 'Admin', 'Staff member role verified as Admin (navigates to /admin)');

    console.log(`\n===============================================================`);
    console.log(`ADMIN SEPARATION TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runAdminSeparationTests();
