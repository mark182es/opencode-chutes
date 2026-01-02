import type { ChutesModel } from './types';

export interface CachedModelData {
  models: ChutesModel[];
  fetchedAt: number;
  expiresAt: number;
}

export class ModelCache {
  private cache: CachedModelData | null = null;
  private ttl: number;

  constructor(ttlSeconds: number = 3600) {
    this.ttl = ttlSeconds * 1000;
  }

  set(models: ChutesModel[]): void {
    const now = Date.now();
    this.cache = {
      models,
      fetchedAt: now,
      expiresAt: now + this.ttl,
    };
  }

  get(): CachedModelData | null {
    if (!this.cache) {
      return null;
    }

    if (Date.now() > this.cache.expiresAt) {
      this.cache = null;
      return null;
    }

    return this.cache;
  }

  getModels(): ChutesModel[] | null {
    const cached = this.get();
    return cached ? cached.models : null;
  }

  isValid(): boolean {
    return this.get() !== null;
  }

  isStale(): boolean {
    if (!this.cache) {
      return true;
    }
    const now = Date.now();
    return now > this.cache.expiresAt;
  }

  clear(): void {
    this.cache = null;
  }

  getAge(): number | null {
    if (!this.cache) {
      return null;
    }
    return Date.now() - this.cache.fetchedAt;
  }

  getRemainingTTL(): number | null {
    if (!this.cache) {
      return null;
    }
    const remaining = this.cache.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}
