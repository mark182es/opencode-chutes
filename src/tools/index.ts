import { tool } from '@opencode-ai/plugin';
import { ModelFetcher } from '../models/fetcher';
import { validateConfig } from '../config';

export function createChutesListModelsTool(
  modelFetcher: ModelFetcher,
  defaultConfig: Record<string, unknown>
) {
  const config = validateConfig(defaultConfig);

  return tool({
    description:
      'List all available Chutes models. Shows model names, providers, pricing, and capabilities.',
    args: {
      filter: tool.schema.string().optional().describe('Filter models by name (substring match)'),
      owned_by: tool.schema
        .string()
        .optional()
        .describe('Filter models by owner/provider (e.g., "Qwen", "DeepSeek")'),
      feature: tool.schema
        .string()
        .optional()
        .describe('Filter by supported feature (e.g., "json_mode", "tools", "reasoning")'),
      show_pricing: tool.schema
        .boolean()
        .optional()
        .describe('Show pricing information (default: true)'),
    },
    async execute(args) {
      try {
        let models = modelFetcher.getCachedModels();
        if (!models || modelFetcher.isCacheStale()) {
          if (!config.apiToken) {
            return '[ERROR] No CHUTES_API_TOKEN configured. Please add "chutes": { "apiToken": "your-token" } to your OpenCode config to fetch models.';
          }
          models = await modelFetcher.refreshModels();
        }

        const registry = modelFetcher.getRegistry();
        let displayModels = registry.getAllDisplayInfo();

        if (args.filter) {
          const filter = args.filter.toLowerCase();
          displayModels = displayModels.filter((m) => m.displayName.toLowerCase().includes(filter));
        }

        if (args.owned_by) {
          const owner = args.owned_by.toLowerCase();
          displayModels = displayModels.filter((m) => m.ownedBy.toLowerCase().includes(owner));
        }

        if (args.feature && args.feature.trim()) {
          const feature = args.feature.trim();
          displayModels = displayModels.filter((m) => m.features && m.features.includes(feature));
        }

        const showPricing = args.show_pricing !== false;

        if (displayModels.length === 0) {
          return 'No models found matching the specified criteria.';
        }

        let output = `# Available Chutes Models (${displayModels.length})\n\n`;

        for (const model of displayModels) {
          output += `## ${model.displayName}\n`;
          output += `- **ID**: \`${model.id}\`\n`;
          output += `- **Provider**: ${model.ownedBy}\n`;
          if (model.quantization) {
            output += `- **Quantization**: ${model.quantization}\n`;
          }
          output += `- **Context Length**: ${model.contextLength.toLocaleString()} tokens\n`;
          if (showPricing) {
            output += `- **Pricing**: $${model.pricing.promptPer1M.toFixed(2)}/1M input, $${model.pricing.completionPer1M.toFixed(2)}/1M output\n`;
          }
          output += `- **Features**: ${(model.features || []).join(', ')}\n`;
          if (model.supportsConfidentialCompute) {
            output += `- **Confidential Compute**: Yes\n`;
          }
          output += '\n';
        }

        const cacheAge = modelFetcher.getCacheAge();
        if (cacheAge !== null) {
          const ageSeconds = Math.floor(cacheAge / 1000);
          output += `---\n*Cache age: ${ageSeconds}s ago*`;
        }

        return output;
      } catch (error) {
        return `[ERROR] Failed to list models: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

export function createChutesRefreshModelsTool(
  modelFetcher: ModelFetcher,
  defaultConfig: Record<string, unknown>
) {
  const config = validateConfig(defaultConfig);

  return tool({
    description:
      'Refresh the list of available Chutes models from the API. Use this to get the latest models.',
    args: {
      force: tool.schema
        .boolean()
        .optional()
        .describe('Force refresh even if cache is valid (default: false)'),
    },
    async execute(args) {
      if (!config.apiToken) {
        return '[ERROR] No CHUTES_API_TOKEN configured. Please add "chutes": { "apiToken": "your-token" } to your OpenCode config.';
      }

      try {
        const wasStale = modelFetcher.isCacheStale();
        await modelFetcher.refreshModels(args.force ?? false);
        const registry = modelFetcher.getRegistry();

        let message = '';
        if (args.force && !wasStale) {
          message = `Forced refresh completed. Found ${registry.size()} models.`;
        } else if (wasStale) {
          message = `Cache was stale, refreshed. Found ${registry.size()} models.`;
        } else {
          message = `Cache still valid (${Math.floor((modelFetcher.getCacheRemainingTTL() || 0) / 1000)}s remaining). Found ${registry.size()} models.`;
        }

        return `${message}\n\nUse the chutes_list_models tool to see available models.`;
      } catch (error) {
        return `[ERROR] Failed to refresh models: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
