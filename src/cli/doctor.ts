import * as fs from 'node:fs';
import * as path from 'node:path';

export async function doctor(): Promise<void> {
  console.log('🐍 chutes-plugin doctor\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let checks = 0;
  let passed = 0;

  function check(name: string, result: boolean, message: string): void {
    checks++;
    if (result) {
      passed++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
      console.log(`   ${message}`);
    }
  }

  const projectDir = process.cwd();
  const pluginFile = path.join(projectDir, '.opencode', 'plugin', 'chutes-plugin.js');
  const hasPlugin = fs.existsSync(pluginFile);

  console.log('Installation Checks:\n');
  check(
    'Plugin installed',
    hasPlugin,
    hasPlugin ? `Location: ${pluginFile}` : 'Run: bunx chutes-plugin install'
  );

  console.log('\nAPI Checks:\n');

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

  check('API token connected', hasAuth, 'Run: opencode, then type: /connect chutes');

  console.log('\nNetwork Checks:\n');

  try {
    const response = await fetch('https://llm.chutes.ai/v1/models', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    check('Can reach Chutes API', response.ok, `HTTP ${response.status}: ${response.statusText}`);

    if (response.ok) {
      const data = (await response.json()) as { data: Array<{ id: string }> };
      console.log(`   Found ${data.data?.length || 0} models available\n`);
    }
  } catch (error) {
    check(
      'Can reach Chutes API',
      false,
      `Connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Results: ${passed}/${checks} checks passed\n`);

  if (passed === checks) {
    console.log("🎉 Everything looks good! You're ready to use chutes-plugin.\n");
  } else {
    console.log('⚠️  Some checks failed. Please address the issues above.\n');
  }
}
