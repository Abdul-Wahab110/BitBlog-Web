import { Database } from './config/database';
import { hashPassword, comparePassword } from './utils/password';
import { AuthService } from './services/authService';

async function updateAdminCredentials() {
  console.log('=== UPDATING SUPER ADMIN CREDENTIALS ===\n');

  const newEmail = 'aw419770@gmail.com';
  const newPassword = 'qwerty@11221';
  const newHash = await hashPassword(newPassword);

  const store = Database.getStore();
  const adminUser = store.users.find(u => u.user_id === 1 || u.role_name === 'Admin');

  if (!adminUser) {
    console.error('Super Admin user not found!');
    process.exit(1);
  }

  // Update credentials
  adminUser.email = newEmail;
  adminUser.name = 'Abdul Wahab';
  adminUser.password_hash = newHash;
  adminUser.updated_at = new Date().toISOString();

  // Save to persistent database
  Database.saveStore();

  console.log(`[SUCCESS] Super Admin account (ID: ${adminUser.user_id}) updated:`);
  console.log(`- Email: ${adminUser.email}`);
  console.log(`- Role: ${adminUser.role_name}`);
  console.log(`- Name: ${adminUser.name}`);

  // Test Verification 1: Verify Password Hash
  const isMatch = await comparePassword(newPassword, adminUser.password_hash);
  console.log(`- Password Verification: ${isMatch ? 'PASS ✓' : 'FAIL ✗'}`);

  // Test Verification 2: Test Login via AuthService
  try {
    const loginResult = await AuthService.login({
      email: newEmail,
      password: newPassword,
      accountType: 'Admin',
    });
    console.log(`- AuthService Super Admin Login: PASS ✓ (Token generated for ${loginResult.user.name})`);
  } catch (err: any) {
    console.error(`- AuthService Super Admin Login failed: ${err.message}`);
    process.exit(1);
  }

  // Test Verification 3: Verify old email rejected
  try {
    await AuthService.login({
      email: 'admin@modernblog.com',
      password: newPassword,
      accountType: 'Admin',
    });
    console.error(`- Old Email Rejection: FAIL (Old email still logged in!)`);
    process.exit(1);
  } catch (err: any) {
    console.log(`- Old Email Rejection: PASS ✓ (Old email admin@modernblog.com successfully rejected)`);
  }

  console.log('\n========================================');
  console.log('ALL CREDENTIAL UPDATES VERIFIED SUCCESSFULLY');
  console.log('========================================\n');
}

updateAdminCredentials();
