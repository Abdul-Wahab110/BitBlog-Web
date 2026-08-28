import { AuditLogModel } from './models/auditLogModel';
import { AuditService } from './services/auditService';

async function testAuditLogSystem() {
  console.log('=== TESTING SYSTEM AUDIT TRAIL & ACTIVITY LOGS ===\n');

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
    // 1. Record a simulated action
    const log1 = await AuditLogModel.record({
      userId: 1,
      userName: 'Super Admin',
      userRole: 'Admin',
      action: 'ROLE_PROMOTED',
      category: 'APPLICATION',
      details: "Promoted 'Hassan Raza' from Reader to verified Author role.",
      ipAddress: '192.168.1.50',
      severity: 'success',
    });

    assert(log1.log_id > 0 && log1.action === 'ROLE_PROMOTED', 'Audit log created successfully with ID');

    // 2. Record another action
    const log2 = await AuditLogModel.record({
      userId: 2,
      userName: 'Chief Editor',
      userRole: 'Editor',
      action: 'POST_APPROVED_PUBLISHED',
      category: 'POST',
      details: "Approved & published article 'Next-Gen High Performance Computing'.",
      ipAddress: '127.0.0.1',
      severity: 'success',
    });

    assert(log2.log_id > log1.log_id, 'Sequential log IDs generated properly');

    // 3. Query all logs
    const allLogs = await AuditLogModel.findAll();
    assert(allLogs.length >= 2, `Retrieved ${allLogs.length} audit logs`);

    // 4. Query with category filter
    const postLogs = await AuditLogModel.findAll({ category: 'POST' });
    assert(postLogs.some(l => l.action === 'POST_APPROVED_PUBLISHED'), 'Category filtering works');

    // 5. Query stats summary
    const stats = await AuditLogModel.getStats();
    assert(stats.totalEvents >= 2 && stats.publishingActions >= 1, 'Audit statistics computed accurately');

    console.log(`\n===============================================================`);
    console.log(`AUDIT LOG SYSTEM TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

testAuditLogSystem();
