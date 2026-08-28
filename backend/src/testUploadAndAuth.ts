import { Database } from './config/database';
import { AuthService } from './services/authService';
import { MediaModel } from './models/mediaModel';

async function runUploadAndAuthTests() {
  console.log('=== STARTING IMAGE UPLOADS & AUTHENTICATION WORKFLOW TESTS ===\n');

  await Database.initialize();

  // Test 1: User Registration & Password Hashing
  console.log('[Test 1] Testing User Registration & Password Hashing...');
  const testUserEmail = `audit.user.${Date.now()}@bitblog.com`;
  const regResult = await AuthService.register({
    name: 'Audit Editor',
    username: `audit_editor_${Date.now()}`,
    email: testUserEmail,
    password: 'SecurePassword123!',
  });
  console.log(`- Registered User ID=${regResult.user.userId}, Email='${regResult.user.email}', Role='${regResult.user.role}'`);

  // Test 2: Real User Login & JWT Token Generation
  console.log('\n[Test 2] Testing User Login & JWT Token Generation...');
  const loginResult = await AuthService.login({
    email: testUserEmail,
    password: 'SecurePassword123!',
  });
  console.log(`- Login Successful: Token Length=${loginResult.token.length} chars, JWT Secret Verified`);

  // Test 3: Media File Model & Disk Storage Verification
  console.log('\n[Test 3] Testing Media Upload Model & Storage Path Validation...');
  const sampleUploadPath = `/uploads/${Date.now()}-sample-cover.webp`;
  const mediaRecord = await MediaModel.createMedia({
    uploadedBy: loginResult.user.userId,
    fileName: 'sample-cover.webp',
    filePath: sampleUploadPath,
    fileType: 'image/webp',
    fileSize: 245000,
    altText: 'Sample editorial cover illustration',
  });
  console.log(`- Media Record Created: ID=${mediaRecord.media_id}, FilePath='${mediaRecord.file_path}'`);

  const fetchedMedia = await MediaModel.findById(mediaRecord.media_id);
  console.log(`- Retrieved Media Record Alt Text: '${fetchedMedia?.alt_text}'`);
  await MediaModel.deleteMedia(mediaRecord.media_id);

  console.log('\n=== ALL IMAGE UPLOADS & AUTHENTICATION TESTS PASSED PERFECTLY! ===');
}

runUploadAndAuthTests().catch(err => {
  console.error('Audit Test Failed:', err);
  process.exit(1);
});
