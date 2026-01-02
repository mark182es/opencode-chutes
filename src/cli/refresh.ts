export async function refresh(): Promise<void> {
  console.log('🐍 opencode-chutes refresh\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Refreshing model cache...\n');

  try {
    const response = await fetch('https://llm.chutes.ai/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Error refreshing models: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const data = (await response.json()) as { data: Array<{ id: string }> };
    const models = data.data || [];

    console.log(`✅ Successfully refreshed ${models.length} models\n`);
    console.log('Note: The cache will be automatically refreshed when OpenCode restarts.');
    console.log('Models are cached in-memory for 1 hour during each OpenCode session.\n');
  } catch (error) {
    console.log(
      `❌ Error refreshing models: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
