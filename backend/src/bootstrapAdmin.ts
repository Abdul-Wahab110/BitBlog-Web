import bcrypt from 'bcrypt';
import { Database } from './config/database';
import { UserModel } from './models/userModel';

async function bootstrapAdmin() {
  console.log('================================================================');
  console.log('BITBLOG CMS — SECURE INITIAL ADMINISTRATOR BOOTSTRAP');
  console.log('================================================================\n');

  try {
    await Database.initialize();

    // 1. Ensure 'Admin' role exists in roles table
    let roleId = await UserModel.getRoleIdByName('Admin');
    if (!roleId) {
      console.log('[Bootstrap] Creating "Admin" role in database...');
      await Database.execute(
        `INSERT INTO roles (role_name, description) VALUES ('Admin', 'Full system administration privileges')`,
        []
      );
      roleId = (await UserModel.getRoleIdByName('Admin')) || 1;
    }

    // 2. Check if an Admin user already exists
    const existingAdmin = await UserModel.findByEmail('admin@bitblog.com');
    if (existingAdmin && (existingAdmin.role_name === 'Admin' || existingAdmin.role_id === roleId)) {
      console.log('STATUS: Admin account already exists in database.');
      console.log(`- Administrator: ${existingAdmin.name} (@${existingAdmin.username})`);
      console.log(`- Email: ${existingAdmin.email}`);
      console.log(`- Role: ${existingAdmin.role_name} (Role ID ${existingAdmin.role_id})`);
      console.log(`- Status: ${existingAdmin.status}`);
      console.log('- No bootstrap modification was needed.');
      console.log('\n================================================================');
      process.exit(0);
    }

    // 3. Parse CLI flags or use secure defaults
    const args = process.argv.slice(2);
    const getArg = (flag: string, fallback: string) => {
      const idx = args.indexOf(flag);
      return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
    };

    const adminName = getArg('--name', 'System Administrator');
    const adminUsername = getArg('--username', 'admin');
    const adminEmail = getArg('--email', 'admin@bitblog.com');
    const adminPassword = getArg('--password', 'admin123');

    // 4. Check if username or email is already taken by non-admin
    const existingEmail = await UserModel.findByEmail(adminEmail);
    if (existingEmail) {
      console.log(`[Bootstrap] Account with email '${adminEmail}' found. Elevating role to Admin...`);
      await Database.execute(`UPDATE users SET role_id = :1 WHERE user_id = :2`, [roleId, existingEmail.user_id]);
      console.log(`✓ Account ID #${existingEmail.user_id} elevated to Admin role.`);
      process.exit(0);
    }

    // 5. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 6. Create initial administrator
    const createdAdmin = await UserModel.createUser({
      roleId,
      name: adminName,
      username: adminUsername.toLowerCase(),
      email: adminEmail.toLowerCase(),
      passwordHash,
    });

    console.log('✓ Initial Administrator created successfully!');
    console.log(`- Name: ${adminName}`);
    console.log(`- Username: ${adminUsername}`);
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Role: Admin (Role ID ${roleId})`);
    console.log('- Status: ACTIVE');
    console.log('\n================================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Bootstrap Error]:', err);
    process.exit(1);
  }
}

bootstrapAdmin();
