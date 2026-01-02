import cac from 'cac';

const cli = cac('opencode-chutes');

cli.version('0.1.0');
cli.usage(`
🐍 opencode-chutes

A plugin for OpenCode that provides access to 58+ state-of-the-art AI models through the Chutes API.

Usage:
  $ opencode-chutes <command>

Commands:
  install    Install the plugin to the current project (.opencode/plugin/)
  status     Check plugin status and configuration
  list       List available models from the Chutes API
  refresh    Force refresh the model cache
  doctor     Verify that everything is configured correctly

Examples:
  $ opencode-chutes install
  $ opencode-chutes status
  $ opencode-chutes list
  $ opencode-chutes refresh
  $ opencode-chutes doctor
`);

cli.command('install', 'Install the plugin to the current project').action(async () => {
  const { install } = await import('./install.js');
  await install();
});

cli.command('status', 'Check plugin status and configuration').action(async () => {
  const { status } = await import('./status.js');
  await status();
});

cli.command('list', 'List available models from the Chutes API').action(async () => {
  const { list } = await import('./list.js');
  await list();
});

cli.command('refresh', 'Force refresh the model cache').action(async () => {
  const { refresh } = await import('./refresh.js');
  await refresh();
});

cli.command('doctor', 'Verify that everything is configured correctly').action(async () => {
  const { doctor } = await import('./doctor.js');
  await doctor();
});

cli.parse();

if (process.argv.length === 2) {
  cli.outputHelp();
}
