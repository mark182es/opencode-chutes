import { describe, it, expect } from 'vitest';
import { ModelCache } from '../models/cache';
import type { ChutesModel } from '../models/types';

const createMockModel = (overrides: Partial<ChutesModel> = {}): ChutesModel => ({
  id: 'Qwen/Qwen3-32B',
  root: 'Qwen/Qwen3-32B',
  pricing: { prompt: 0.08, completion: 0.24 },
  object: 'model',
  parent: null,
  created: 1767182873,
  chute_id: '0d7184a2-32a3-53e0-9607-058c37edaab5',
  owned_by: 'sglang',
  quantization: 'bf16',
  max_model_len: 40960,
  context_length: 40960,
  input_modalities: ['text'],
  max_output_length: 40960,
  output_modalities: ['text'],
  supported_features: ['json_mode', 'tools', 'structured_outputs', 'reasoning'],
  confidential_compute: false,
  ...overrides,
});

describe('ModelCache', () => {
  describe('set and get', () => {
    it('should store and retrieve models', () => {
      const cache = new ModelCache(3600);
      const models = [createMockModel(), createMockModel({ id: 'DeepSeek/DeepSeek-R1' })];

      cache.set(models);
      const result = cache.getModels();

      expect(result).toEqual(models);
      expect(result?.length).toBe(2);
    });

    it('should return null for empty cache', () => {
      const cache = new ModelCache(3600);

      expect(cache.getModels()).toBeNull();
    });
  });

  describe('TTL and expiration', () => {
    it('should indicate valid when cache is fresh', () => {
      const cache = new ModelCache(3600);
      const models = [createMockModel()];

      cache.set(models);
      expect(cache.isValid()).toBe(true);
      expect(cache.isStale()).toBe(false);
    });

    it('should report cache age', () => {
      const cache = new ModelCache(3600);
      const models = [createMockModel()];

      cache.set(models);
      const age = cache.getAge();

      expect(age).not.toBeNull();
      expect(age).toBeGreaterThanOrEqual(0);
    });

    it('should report remaining TTL', () => {
      const cache = new ModelCache(3600);
      const models = [createMockModel()];

      cache.set(models);
      const ttl = cache.getRemainingTTL();

      expect(ttl).not.toBeNull();
      expect(ttl).toBeLessThanOrEqual(3600 * 1000);
      expect(ttl).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      const cache = new ModelCache(3600);
      const models = [createMockModel()];

      cache.set(models);
      expect(cache.isValid()).toBe(true);

      cache.clear();
      expect(cache.isValid()).toBe(false);
      expect(cache.getModels()).toBeNull();
      expect(cache.getAge()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty model array', () => {
      const cache = new ModelCache(3600);

      cache.set([]);
      expect(cache.getModels()).toEqual([]);
      expect(cache.isValid()).toBe(true);
    });

    it('should use custom TTL', () => {
      const cache = new ModelCache(60);
      const models = [createMockModel()];

      cache.set(models);
      expect(cache.isValid()).toBe(true);

      const ttl = cache.getRemainingTTL();
      expect(ttl).not.toBeNull();
      expect(ttl).toBeLessThanOrEqual(60 * 1000);
    });

    it('should handle very short TTL', () => {
      const cache = new ModelCache(1);
      const models = [createMockModel()];

      cache.set(models);
      expect(cache.getRemainingTTL()).toBeLessThanOrEqual(1000);
    });

    it('should handle very long TTL', () => {
      const cache = new ModelCache(86400);
      const models = [createMockModel()];

      cache.set(models);
      expect(cache.getRemainingTTL()).toBeLessThanOrEqual(86400 * 1000);
      expect(cache.getRemainingTTL()).toBeGreaterThan(86399 * 1000);
    });
  });
});
