import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function install(): Promise<void> {
  console.log('🐍 chutes-plugin installer\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const projectDir = process.cwd();
  const opencodeConfigPath = path.join(projectDir, 'opencode.json');
  const projectPluginDir = path.join(projectDir, '.opencode', 'plugin');
  const globalPluginDir = path.join(os.homedir(), '.config', 'opencode', 'plugin');

  const distFile = path.resolve(__dirname, '..', '..', 'dist', 'bundle.js');
  if (!fs.existsSync(distFile)) {
    console.error('❌ Error: dist/bundle.js not found. Run "bun run build:bundle" first.');
    process.exit(1);
  }

  let installTarget: 'project' | 'global' | 'cancel' = 'project';
  let pluginDir: string;
  let pluginFile: string;

  if (fs.existsSync(opencodeConfigPath)) {
    console.log('Detected opencode.json in current directory.\n');
    console.log('Where would you like to install the plugin?');
    console.log('  [1] Project (./.opencode/plugin/)');
    console.log('  [2] Global (~/.config/opencode/plugin/)');
    console.log('  [c] Cancel\n');

    const { createInterface } = await import('node:readline/promises');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question('Select option [1/2/c]: ')).trim().toLowerCase();
    await rl.close();

    if (answer === '1' || answer === '') {
      installTarget = 'project';
    } else if (answer === '2') {
      installTarget = 'global';
    } else {
      console.log('Installation cancelled.\n');
      return;
    }
  } else {
    installTarget = 'project';
  }

  if (installTarget === 'project') {
    pluginDir = projectPluginDir;
    pluginFile = path.join(pluginDir, 'chutes-plugin.js');
    console.log('\nInstalling chutes-plugin to project...\n');
  } else {
    pluginDir = globalPluginDir;
    pluginFile = path.join(pluginDir, 'chutes-plugin.js');
    console.log('\nInstalling chutes-plugin globally...\n');
  }

  console.log('Creating plugin directory...\n');
  fs.mkdirSync(pluginDir, { recursive: true });

  console.log('Copying plugin...\n');
  fs.copyFileSync(distFile, pluginFile);

  console.log('✅ Successfully installed!');
  console.log(`   Location: ${pluginFile}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Next steps:');
  console.log("1. Restart OpenCode if it's running");
  console.log('2. Run: opencode');
  console.log('3. Connect your token: /connect chutes');
  console.log('4. Select a Chutes model from the dropdown');
  console.log('\nAvailable tools:');
  console.log('   - chutes_list_models');
  console.log('   - chutes_refresh_models');
  console.log('   - chutes_status');
}
