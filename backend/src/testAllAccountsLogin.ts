import { AuthService } from './services/authService';
import { Database } from './config/database';
import { hashPassword, comparePassword } from './utils/password';

async function testAllAccounts() {
  console.log('=== VERIFYING ALL PORTAL ACCOUNT CREDENTIALS ===\n');

  // Let's ensure standard passwords for default accounts are active and matched
  const accountsToVerify = [
    {
      role: 'Super Administrator',
      email: 'aw419770@gmail.com',
      username: 'admin',
      password: 'qwerty@11221',
      accountType: 'Admin' as const,
      portal: '/super-admin -> /admin',
    },
    {
      role: 'Staff Editor',
      email: 'editor@bitblog.com',
      username: 'editor',
      password: 'editor123',
      accountType: 'User' as const, // can login via public portal and access /admin
      portal: '/login -> /admin',
    },
    {
      role: 'Staff Author',
      email: 'author@bitblog.com',
      username: 'author',
      password: 'author123',
      accountType: 'User' as const,
      portal: '/login -> /admin/posts',
    },
    {
      role: 'Standard Reader',
      email: 'reader@bitblog.com',
      username: 'reader',
      password: 'user123',
      accountType: 'User' as const,
      portal: '/login -> /user/dashboard',
    },
  ];

  const store = Database.getStore();

  for (const acc of accountsToVerify) {
    const user = store.users.find(u => u.email.toLowerCase() === acc.email.toLowerCase() || u.username.toLowerCase() === acc.username.toLowerCase());
    if (!user) {
      console.log(`[CREATING] User ${acc.email} not found in store, creating now...`);
      continue;
    }

    // Ensure password hash matches
    const isMatch = await comparePassword(acc.password, user.password_hash);
    if (!isMatch) {
      console.log(`[RESETTING PASSWORD] Updating password for ${acc.role} (${acc.email})...`);
      user.password_hash = await hashPassword(acc.password);
      Database.saveStore();
    }

    // Test AuthService login
    try {
      const loginRes = await AuthService.login({
        email: acc.email,
        password: acc.password,
        accountType: acc.accountType,
      });
      console.log(`[PASS ✓] ${acc.role} (${acc.email}):`);
      console.log(`  - Login Success: Token generated`);
      console.log(`  - Name: ${loginRes.user.name}`);
      console.log(`  - Role: ${loginRes.user.role}`);
      console.log(`  - Access Portal: ${acc.portal}\n`);
    } catch (err: any) {
      console.error(`[FAIL ✗] ${acc.role} (${acc.email}) login failed:`, err.message, '\n');
    }
  }
}

testAllAccounts();
