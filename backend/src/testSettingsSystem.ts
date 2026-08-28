import { SettingModel } from './models/settingModel';

async function testSettings() {
  console.log('=== TESTING SYSTEM SETTINGS REAL-TIME PERSISTENCE ===\n');

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
    // 1. Fetch initial settings
    const initial = await SettingModel.getSettings();
    assert(initial !== null && typeof initial.site_name === 'string', 'Initial settings retrieved successfully');

    // 2. Update settings
    const testPayload = {
      site_name: 'ModernBlog Digital Journal 2026',
      contact_email: 'chief-editor@modernblog.com',
      site_description: 'Updated publication description for test validation.',
      posts_per_page: 15,
      comments_enabled: true,
      newsletter_enabled: true,
    };

    const updated = await SettingModel.updateSettings(testPayload);
    assert(updated.site_name === 'ModernBlog Digital Journal 2026', 'Updated site_name persisted');
    assert(updated.contact_email === 'chief-editor@modernblog.com', 'Updated contact_email persisted');
    assert(updated.posts_per_page === 15, 'Updated posts_per_page persisted as number');

    // 3. Refetch to verify real-time persistence
    const reFetched = await SettingModel.getSettings();
    assert(reFetched.site_name === 'ModernBlog Digital Journal 2026', 'Refetched settings match real-time database state');
    assert(reFetched.contact_email === 'chief-editor@modernblog.com', 'Refetched contact_email matches');

    console.log(`\n===============================================================`);
    console.log(`SETTINGS TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Settings test error:', err);
    process.exit(1);
  }
}

testSettings();
