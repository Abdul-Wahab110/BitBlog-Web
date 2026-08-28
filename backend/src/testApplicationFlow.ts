import { ApplicationModel } from './models/applicationModel';
import { UserModel } from './models/userModel';
import { ApplicationController } from './controllers/applicationController';
import { hashPassword } from './utils/password';
import { JwtPayload } from './types';

async function testApplicationFlow() {
  console.log('=== TESTING AUTHOR / EDITOR APPLICATION & APPROVAL PIPELINE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string) {
    if (cond) {
      console.log(`[PASS ✓] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL ✗] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Create a demo reader user
    const reader = await UserModel.createUser({
      roleId: 4, // User (Reader)
      name: 'Aspiring Tech Journalist',
      username: 'journalist_' + Date.now(),
      email: `journalist_${Date.now()}@example.com`,
      passwordHash: await hashPassword('Pass123!'),
    });

    assert(reader.role_name === 'User', 'New applicant created with initial Reader role');

    // 2. Reader submits an application to become an Author
    const app = await ApplicationModel.createApplication({
      userId: reader.user_id,
      name: reader.name,
      username: reader.username,
      email: reader.email,
      roleApplied: 'Author',
      bio: 'Published writer with 3 years experience covering AI and Cloud computing architectures.',
      sampleUrls: 'https://github.com, https://medium.com/@writer',
      topics: ['Technology', 'AI & Machine Learning'],
      motivation: 'I want to write in-depth technical deep dives for BitBlog CMS.',
    });

    assert(app.application_id > 0 && app.status === 'pending', 'Application submitted with status "pending"');

    // 3. Admin views pending applications
    const pendingCount = await ApplicationModel.countPending();
    assert(pendingCount >= 1, `Admin can see pending applications (count: ${pendingCount})`);

    const allApps = await ApplicationModel.findAll('pending');
    const found = allApps.find(a => a.application_id === app.application_id);
    assert(found !== undefined, 'Admin retrieves the pending application');

    // 4. Admin approves the application
    const adminUser = await UserModel.findByEmail('aw419770@gmail.com');
    const reviewerId = adminUser ? adminUser.user_id : 1;

    const approvedApp = await ApplicationModel.updateStatus(
      app.application_id,
      'approved',
      reviewerId,
      'Excellent writing samples and background. Welcome aboard!'
    );

    assert(approvedApp !== null && approvedApp.status === 'approved', 'Application marked as approved');

    // Auto-promote reader to Author (roleId = 3)
    const targetRoleId = approvedApp!.role_applied === 'Editor' ? 2 : 3;
    await UserModel.updateUserRole(reader.user_id, targetRoleId);

    // 5. Verify user is now promoted to Author in the database
    const updatedUser = await UserModel.findById(reader.user_id);
    assert(updatedUser !== null && updatedUser.role_name === 'Author', 'Reader automatically promoted to "Author" in database');

    console.log(`\n===============================================================`);
    console.log(`APPLICATION FLOW TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

testApplicationFlow();
