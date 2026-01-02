import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';
import { ModelFetcher, type ChutesModelDisplayInfo } from './models';
import { createChutesListModelsTool, createChutesRefreshModelsTool } from './tools';
import { getChutesApiKeyFromAuth } from './config';

function modelToOpenCodeFormat(model: ChutesModelDisplayInfo) {
  const modelKey = model.id.replace('chutes/', '');

  return {
    id: modelKey,
    name: model.displayName,
    release_date: '2024-01-01',
    attachment: model.inputModalities.includes('image') || model.inputModalities.includes('file'),
    reasoning: model.features.includes('reasoning'),
    temperature: true,
    tool_call: model.features.includes('tools'),
    cost: {
      input: model.pricing.promptPer1M,
      output: model.pricing.completionPer1M,
    },
    limit: {
      context: model.contextLength,
      output: 16384,
    },
    modalities: {
      input: model.inputModalities as Array<'text' | 'audio' | 'image' | 'video' | 'pdf'>,
      output: model.outputModalities as Array<'text' | 'audio' | 'image' | 'video' | 'pdf'>,
    },
    options: {},
  };
}

export const ChutesPlugin: Plugin = async (_ctx) => {
  let config = {
    apiToken: undefined as string | undefined,
    autoRefresh: true,
    refreshInterval: 3600,
  };

  const modelFetcher = new ModelFetcher({
    apiBaseUrl: 'https://llm.chutes.ai/v1',
    cacheTtlSeconds: config.refreshInterval,
  });

  const statusTool = tool({
    description: 'Check the status of the Chutes plugin and model cache',
    args: {},
    async execute() {
      const isCached = modelFetcher.isCacheValid();
      const cacheAge = modelFetcher.getCacheAge();
      const remainingTTL = modelFetcher.getCacheRemainingTTL();
      const registry = modelFetcher.getRegistry();

      let status = `# Chutes Plugin Status\n\n`;
      status += `- **Models Cached**: ${registry.size()}\n`;
      status += `- **Cache Valid**: ${isCached ? 'Yes' : 'No'}\n`;

      if (isCached) {
        status += `- **Cache Age**: ${Math.floor((cacheAge || 0) / 1000)}s\n`;
        status += `- **Remaining TTL**: ${Math.floor((remainingTTL || 0) / 1000)}s\n`;
      }

      if (!config.apiToken) {
        status += `\n⚠️ **Warning**: No API token configured. Add "chutes": { "apiToken": "your-token" } to your config.\n`;
      }

      return status;
    },
  });

  return {
    tool: {
      chutes_list_models: createChutesListModelsTool(modelFetcher, {}),
      chutes_refresh_models: createChutesRefreshModelsTool(modelFetcher, {}),
      chutes_status: statusTool,
    },

    async config(userConfig: Record<string, unknown>) {
      let apiToken: string | undefined;
      let autoRefresh = true;

      const chutesConfig = userConfig.chutes as Record<string, unknown> | undefined;
      if (chutesConfig) {
        if (chutesConfig.apiToken) {
          apiToken = chutesConfig.apiToken as string;
        }
        if (chutesConfig.autoRefresh !== undefined) {
          autoRefresh = chutesConfig.autoRefresh as boolean;
        }
      }

      const providerData = userConfig.provider as Record<string, unknown> | undefined;
      const chutesProviderData =
        providerData?.chutes && typeof providerData.chutes === 'object'
          ? (providerData.chutes as Record<string, unknown>)
          : undefined;
      if (chutesProviderData) {
        const options = chutesProviderData.options as Record<string, unknown> | undefined;
        if (options?.apiKey && !apiToken) {
          apiToken = options.apiKey as string;
        }
      }

      if (!apiToken) {
        apiToken = getChutesApiKeyFromAuth() ?? undefined;
      }

      config = { apiToken, autoRefresh, refreshInterval: 3600 };

      if (apiToken) {
        modelFetcher.setApiToken(apiToken);
      }

      userConfig.provider = userConfig.provider ?? {};
      const providerConfig = userConfig.provider as Record<string, unknown>;
      providerConfig['chutes'] = {
        api: 'https://llm.chutes.ai/v1',
        name: 'Chutes',
        env: ['CHUTES_API_TOKEN'],
        id: 'chutes',
        models: {},
        options: {
          apiKey: config.apiToken,
          baseURL: 'https://llm.chutes.ai/v1',
        },
      };

      const chutesProvider = providerConfig['chutes'] as Record<string, unknown>;
      const modelsConfig = chutesProvider.models as Record<string, unknown>;

      if (config.autoRefresh) {
        try {
          await modelFetcher.refreshModels();
          const registry = modelFetcher.getRegistry();

          for (const model of registry.getAllDisplayInfo()) {
            const modelKey = model.id.replace('chutes/', '');
            modelsConfig[modelKey] = modelToOpenCodeFormat(model);
          }
        } catch {
          // Silently fail on model refresh - models can be refreshed manually later
        }
      }
    },
  };
};

export default ChutesPlugin;
