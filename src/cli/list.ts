export async function list(): Promise<void> {
  console.log('🐍 opencode-chutes models\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Fetching models from Chutes API...\n');

  try {
    const response = await fetch('https://llm.chutes.ai/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Error fetching models: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const data = (await response.json()) as {
      data: Array<{
        id: string;
        owned_by: string;
        pricing: { prompt: number; completion: number };
      }>;
    };
    const models = data.data || [];

    console.log(`Found ${models.length} models:\n`);

    for (const model of models) {
      console.log(`• ${model.id}`);
      console.log(`  Owner: ${model.owned_by}`);
      console.log(
        `  Pricing: $${model.pricing.prompt.toFixed(2)}/M input, $${model.pricing.completion.toFixed(2)}/M output\n`
      );
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Tip: To use these models:');
    console.log('1. Install the plugin: bunx opencode-chutes install');
    console.log('2. Start OpenCode: opencode');
    console.log('3. Connect token: /connect chutes');
    console.log('4. Select a Chutes model from the dropdown\n');
  } catch (error) {
    console.log(
      `❌ Error fetching models: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
