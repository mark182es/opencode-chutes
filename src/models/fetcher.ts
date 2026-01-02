import type { ChutesModel, ChutesModelsResponse } from './types';
import { ModelCache } from './cache';
import { ModelRegistry } from './registry';

export interface ModelFetcherConfig {
  apiBaseUrl?: string;
  cacheTtlSeconds?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class ModelFetchError extends Error {
  constructor(
    message: string,
    public readonly _code: string,
    public readonly _statusCode?: number,
    public readonly _originalError?: Error
  ) {
    super(message);
    this.name = 'ModelFetchError';
  }
}

export class ModelFetcher {
  private apiBaseUrl: string;
  private cache: ModelCache;
  private registry: ModelRegistry;
  private maxRetries: number;
  private retryDelayMs: number;
  private apiToken: string | null = null;

  constructor(config: ModelFetcherConfig = {}) {
    this.apiBaseUrl = config.apiBaseUrl || 'https://llm.chutes.ai/v1';
    this.cache = new ModelCache(config.cacheTtlSeconds || 3600);
    this.registry = new ModelRegistry();
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelayMs || 1000;
  }

  setApiToken(token: string | null): void {
    this.apiToken = token;
  }

  getApiToken(): string | null {
    return this.apiToken;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  private async fetchWithRetry(
    url: string,
    options: { method?: string; body?: string; headers?: Record<string, string> }
  ): Promise<Response> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...options.headers,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new ModelFetchError(
              'Invalid or missing API token. Please configure your CHUTES_API_TOKEN.',
              'AUTH_ERROR',
              response.status
            );
          }

          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.retryDelayMs;
            if (attempt < this.maxRetries) {
              await this.delay(delay);
              continue;
            }
            throw new ModelFetchError(
              'Rate limit exceeded. Please try again later.',
              'RATE_LIMIT',
              response.status
            );
          }

          if (response.status >= 500) {
            if (attempt < this.maxRetries) {
              await this.delay(this.retryDelayMs * (attempt + 1));
              continue;
            }
            throw new ModelFetchError(
              `Server error: ${response.status} ${response.statusText}`,
              'SERVER_ERROR',
              response.status
            );
          }

          throw new ModelFetchError(
            `HTTP error: ${response.status} ${response.statusText}`,
            'HTTP_ERROR',
            response.status
          );
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (error instanceof ModelFetchError) {
          throw error;
        }
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelayMs * (attempt + 1));
          continue;
        }
        throw new ModelFetchError(
          `Failed to fetch models: ${lastError.message}`,
          'NETWORK_ERROR',
          undefined,
          lastError
        );
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchModels(): Promise<ChutesModel[]> {
    const cachedModels = this.cache.getModels();
    if (cachedModels) {
      return cachedModels;
    }

    const response = await this.fetchWithRetry(`${this.apiBaseUrl}/models`, { method: 'GET' });

    const data: ChutesModelsResponse = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new ModelFetchError('Invalid response format from API', 'INVALID_RESPONSE');
    }

    this.cache.set(data.data);
    this.registry.registerAll(data.data);

    return data.data;
  }

  async refreshModels(force: boolean = false): Promise<ChutesModel[]> {
    if (force) {
      this.cache.clear();
    }
    return this.fetchModels();
  }

  getCachedModels(): ChutesModel[] | null {
    return this.cache.getModels();
  }

  getRegistry(): ModelRegistry {
    return this.registry;
  }

  isCacheValid(): boolean {
    return this.cache.isValid();
  }

  isCacheStale(): boolean {
    return this.cache.isStale();
  }

  clearCache(): void {
    this.cache.clear();
    this.registry.clear();
  }

  getCacheAge(): number | null {
    return this.cache.getAge();
  }

  getCacheRemainingTTL(): number | null {
    return this.cache.getRemainingTTL();
  }
}
