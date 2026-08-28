import { AuthService } from './services/authService';
import { UserModel } from './models/userModel';
import { comparePassword } from './utils/password';

async function testCurrentAdminLogin() {
  console.log('--- TESTING SUPER ADMIN LOGIN ---');

  const email = 'aw419770@gmail.com';
  const password = 'qwerty@11221';

  const user = await UserModel.findByEmail(email);
  console.log('User found in UserModel.findByEmail:', user ? { id: user.user_id, email: user.email, role: user.role_name } : 'NOT FOUND');

  if (user) {
    const isPwMatch = await comparePassword(password, user.password_hash);
    console.log('Direct password comparison with hash:', isPwMatch ? 'MATCH ✓' : 'MISMATCH ✗');
  }

  try {
    const authRes = await AuthService.login({
      email,
      password,
      accountType: 'Admin',
    });
    console.log('[SUCCESS] AuthService.login succeeded for:', authRes.user);
  } catch (err: any) {
    console.error('[ERROR] AuthService.login failed:', err.message);
  }
}

testCurrentAdminLogin();
