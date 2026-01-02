import * as fs from 'node:fs';
import * as path from 'node:path';

export async function status(): Promise<void> {
  console.log('🐍 opencode-chutes status\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const projectDir = process.cwd();
  const pluginFile = path.join(projectDir, '.opencode', 'plugin', 'opencode-chutes.js');

  const hasPlugin = fs.existsSync(pluginFile);

  console.log(`Plugin installed: ${hasPlugin ? '✅ Yes' : '❌ No'}`);
  if (hasPlugin) {
    console.log(`Location: ${pluginFile}`);
  } else {
    console.log('\nTo install:');
    console.log('  bunx opencode-chutes install\n');
  }

  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const authPath = homeDir ? path.join(homeDir, '.local', 'share', 'opencode', 'auth.json') : null;
  let hasAuth = false;
  if (authPath && fs.existsSync(authPath)) {
    try {
      const content = fs.readFileSync(authPath, 'utf-8');
      const auth = JSON.parse(content);
      hasAuth = !!(auth.chutes || auth.CHUTES_API_TOKEN || auth.chutes_api_token);
    } catch {
      hasAuth = false;
    }
  }

  console.log(`API Token: ${hasAuth ? '✅ Connected' : '⚠️  Not connected'}`);
  if (!hasAuth) {
    console.log('\nTo connect your token:');
    console.log('  1. Run: opencode');
    console.log('  2. Type: /connect chutes\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
