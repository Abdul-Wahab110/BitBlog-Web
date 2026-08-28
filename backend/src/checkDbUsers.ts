import { Database } from './config/database';

async function checkUsers() {
  await Database.initialize();
  const users = await Database.execute<any>('SELECT user_id, role_id, name, username, email, status, created_at FROM users');
  console.log('--- USERS IN ORACLE DATABASE ---');
  console.log(JSON.stringify(users, null, 2));
  const roles = await Database.execute<any>('SELECT * FROM roles');
  console.log('--- ROLES IN ORACLE DATABASE ---');
  console.log(JSON.stringify(roles, null, 2));
  process.exit(0);
}

checkUsers().catch(err => {
  console.error('Error checking users:', err);
  process.exit(1);
});
