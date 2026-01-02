#!/usr/bin/env bun

import { ModelFetcher } from './src/models/fetcher';

const API_TOKEN = process.env.CHUTES_API_TOKEN || '';

console.log('API_TOKEN present:', API_TOKEN ? 'Yes (' + API_TOKEN.length + ' chars)' : 'No');

if (!API_TOKEN) {
  console.error('\n❌ Error: CHUTES_API_TOKEN not set');
  console.error('\nTo test:');
  console.error('  1. Get your token from https://chutes.ai');
  console.error('  2. Run: export CHUTES_API_TOKEN="your-token" && bun test-local.ts\n');
  process.exit(1);
}

console.log('\nTesting Chutes Plugin...\n');

const modelFetcher = new ModelFetcher({
  apiBaseUrl: 'https://llm.chutes.ai/v1',
  cacheTtlSeconds: 3600,
});

modelFetcher.setApiToken(API_TOKEN);

async function test() {
  try {
    console.log('1. Fetching models...');
    const models = await modelFetcher.fetchModels();
    console.log(`   ✓ Found ${models.length} models\n`);

    console.log('2. Testing model registry...');
    const registry = modelFetcher.getRegistry();
    console.log(`   ✓ Registry has ${registry.size()} models`);
    console.log(`   ✓ Sample model: ${registry.getAllDisplayInfo()[0]?.id}\n`);

    console.log('3. Testing cache...');
    console.log(`   ✓ Cache valid: ${modelFetcher.isCacheValid()}`);
    console.log(`   ✓ Remaining TTL: ${modelFetcher.getCacheRemainingTTL()}ms\n`);

    console.log('All tests passed! ✓');
    console.log('\nNote: Chat functionality is now handled natively by OpenCode.');
    console.log('Select a Chutes model from the dropdown to chat.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nMake sure your CHUTES_API_TOKEN is valid.');
    console.error('Get a token at: https://chutes.ai\n');
    process.exit(1);
  }
}

test();
