export interface ChutesPluginConfig {
  apiToken?: string;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultModel?: string;
  modelFilter?: string[];
}

export interface ChutesPluginConfigInput {
  apiToken?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultModel?: string;
  modelFilter?: string[];
}

export const DEFAULT_CONFIG: ChutesPluginConfig = {
  autoRefresh: true,
  refreshInterval: 3600,
};

export function validateConfig(input: ChutesPluginConfigInput): ChutesPluginConfig {
  const config: ChutesPluginConfig = {
    ...DEFAULT_CONFIG,
  };

  if (input.apiToken !== undefined) {
    if (typeof input.apiToken !== 'string') {
      throw new Error('apiToken must be a string');
    }
    if (input.apiToken.trim() === '') {
      throw new Error('apiToken cannot be empty');
    }
    config.apiToken = input.apiToken;
  }

  if (input.autoRefresh !== undefined) {
    if (typeof input.autoRefresh !== 'boolean') {
      throw new Error('autoRefresh must be a boolean');
    }
    config.autoRefresh = input.autoRefresh;
  }

  if (input.refreshInterval !== undefined) {
    if (typeof input.refreshInterval !== 'number') {
      throw new Error('refreshInterval must be a number');
    }
    if (input.refreshInterval < 60) {
      throw new Error('refreshInterval must be at least 60 seconds');
    }
    if (input.refreshInterval > 86400) {
      throw new Error('refreshInterval must be at most 86400 seconds (24 hours)');
    }
    config.refreshInterval = input.refreshInterval;
  }

  if (input.defaultModel !== undefined) {
    if (typeof input.defaultModel !== 'string') {
      throw new Error('defaultModel must be a string');
    }
    if (input.defaultModel.trim() === '') {
      throw new Error('defaultModel cannot be empty');
    }
    config.defaultModel = input.defaultModel;
  }

  if (input.modelFilter !== undefined) {
    if (!Array.isArray(input.modelFilter)) {
      throw new Error('modelFilter must be an array');
    }
    for (const filter of input.modelFilter) {
      if (typeof filter !== 'string') {
        throw new Error('modelFilter values must be strings');
      }
    }
    config.modelFilter = input.modelFilter;
  }

  return config;
}

export function hasApiToken(config: ChutesPluginConfig): boolean {
  return !!config.apiToken && config.apiToken.trim() !== '';
}
