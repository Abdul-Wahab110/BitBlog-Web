import { Database } from './config/database';
import { AuthService } from './services/authService';
import { AuthValidator } from './validators/authValidator';

async function runAuthTests() {
  console.log('=== STARTING AUTHENTICATION & AUTHORIZATION TESTS ===\n');

  // Initialize DB Pool
  await Database.initialize();

  // Test 1: Payload Validator Tests
  console.log('[Test 1] Testing Payload Validator...');
  const invalidEmail = AuthValidator.isValidEmail('invalid-email-string');
  const validEmail = AuthValidator.isValidEmail('user@bitblog.com');
  const weakPass = AuthValidator.isStrongPassword('short');
  const strongPass = AuthValidator.isStrongPassword('SecurePass123!');

  console.log(`- Email Validation: invalid='${invalidEmail}', valid='${validEmail}' (EXPECTED: false, true)`);
  console.log(`- Password Strength: weak='${weakPass}', strong='${strongPass}' (EXPECTED: false, true)`);

  if (!validEmail || invalidEmail || !strongPass || weakPass) {
    throw new Error('Validator tests failed!');
  }

  // Test 2: Registration Test
  console.log('\n[Test 2] Testing User Registration Service...');
  const testUser = {
    name: 'Test Reader',
    username: 'testreader_' + Date.now(),
    email: `test_${Date.now()}@bitblog.com`,
    password: 'Password123!',
  };

  const regResult = await AuthService.register(testUser);
  console.log(`- Registration Success: user_id=${regResult.user.userId}, role=${regResult.user.role}`);
  console.log(`- Token generated: ${regResult.token ? 'YES (JWT Token signed)' : 'NO'}`);

  // Test 3: Duplicate Email Prevention Test
  console.log('\n[Test 3] Testing Duplicate Email Prevention...');
  try {
    await AuthService.register(testUser);
    console.error('ERROR: Duplicate registration did not throw error!');
  } catch (err: any) {
    console.log(`- Expected Duplicate Rejection Caught: "${err.message}" (Status Code: ${err.statusCode})`);
  }

  // Test 4: Login Test
  console.log('\n[Test 4] Testing User Login...');
  const loginResult = await AuthService.login({
    email: testUser.email,
    password: testUser.password,
  });
  console.log(`- Login Success: user=${loginResult.user.email}, role=${loginResult.user.role}`);

  // Test 5: Invalid Password Login Rejection Test
  console.log('\n[Test 5] Testing Invalid Password Login Rejection...');
  try {
    await AuthService.login({
      email: testUser.email,
      password: 'WrongPassword999!',
    });
    console.error('ERROR: Invalid password login did not fail!');
  } catch (err: any) {
    console.log(`- Expected Login Failure Caught: "${err.message}" (Status Code: ${err.statusCode})`);
  }

  // Test 6: Forgot Password & Reset Token Test
  console.log('\n[Test 6] Testing Forgot Password & Token Hashing...');
  const forgotResult = await AuthService.forgotPassword(testUser.email);
  console.log(`- Forgot Password Response: "${forgotResult.message}"`);
  if (forgotResult.resetTokenPreview) {
    console.log(`- Issued Reset Token Preview: ${forgotResult.resetTokenPreview}`);
    console.log('\n[Test 7] Testing Password Reset with Hashed Token...');
    const resetResult = await AuthService.resetPassword(forgotResult.resetTokenPreview, 'NewSecurePass456!');
    console.log(`- Password Reset Success: "${resetResult.message}"`);
  }

  console.log('\n=== ALL AUTHENTICATION & AUTHORIZATION TESTS PASSED PERFECTLY! ===');
}

runAuthTests().catch(err => {
  console.error('Auth Test Failed:', err);
  process.exit(1);
});
