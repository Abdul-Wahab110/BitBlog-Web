import { AuthService } from './services/authService';

async function testAdminStealthRejection() {
  console.log('=== TESTING SUPER ADMIN PUBLIC PORTAL CLOAKING ===\n');

  // 1. Attempt login on Public Reader Portal with Super Admin email
  let readerPortalBlocked = false;
  let readerPortalErrorMsg = '';

  try {
    await AuthService.login({
      email: 'aw419770@gmail.com',
      password: 'qwerty@11221',
      accountType: 'User',
    });
  } catch (err: any) {
    readerPortalBlocked = true;
    readerPortalErrorMsg = err.message;
  }

  console.log(`- Public Login Attempt Blocked: ${readerPortalBlocked ? 'YES ✓' : 'NO ✗'}`);
  console.log(`- Public Error Message Displayed: "${readerPortalErrorMsg}"`);

  if (readerPortalErrorMsg === 'Invalid email or password credentials') {
    console.log('[PASS ✓] Public site returns generic "Invalid email or password credentials" without leaking Super Admin existence.');
  } else {
    console.error('[FAIL ✗] Leaked private gateway message!');
    process.exit(1);
  }

  // 2. Attempt login on Secret Super Admin Gateway
  try {
    const adminRes = await AuthService.login({
      email: 'aw419770@gmail.com',
      password: 'qwerty@11221',
      accountType: 'Admin',
    });
    console.log(`\n[PASS ✓] Secret Super Admin Gateway login succeeded for: ${adminRes.user.name} (${adminRes.user.role})`);
  } catch (err: any) {
    console.error('\n[FAIL ✗] Secret Super Admin Gateway failed:', err.message);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('CLOAKING & SECRET GATEWAY AUTHENTICATION VERIFIED 100%');
  console.log('======================================================\n');
}

testAdminStealthRejection();
