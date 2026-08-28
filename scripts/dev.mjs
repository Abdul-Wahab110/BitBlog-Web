import { spawn, execSync } from 'child_process';

console.log('🚀 Starting BitBlog CMS (Backend + Frontend)...\n');

// Automatically free port 5000 if occupied by a previous zombie process
try {
  if (process.platform === 'win32') {
    const netstatOut = execSync('netstat -ano', { encoding: 'utf-8' });
    const lines = netstatOut.split('\n');
    for (const line of lines) {
      if (line.includes(':5000') && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
          console.log(`[Auto Cleanup] Freeing port 5000 (killing previous PID ${pid})...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        }
      }
    }
  }
} catch (e) {
  // Ignored if port is already free
}

const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: './frontend',
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n🛑 Stopping BitBlog CMS development servers...');
  try {
    backend.kill('SIGINT');
  } catch {}
  try {
    frontend.kill('SIGINT');
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
