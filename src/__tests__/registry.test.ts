import { describe, it, expect } from 'vitest';
import { ModelRegistry } from '../models/registry';
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

describe('ModelRegistry', () => {
  describe('register', () => {
    it('should register a single model', () => {
      const registry = new ModelRegistry();
      const model = createMockModel();

      registry.register(model);

      expect(registry.size()).toBe(1);
      expect(registry.get('Qwen/Qwen3-32B')).toEqual(model);
    });

    it('should register multiple models', () => {
      const registry = new ModelRegistry();
      const models = [
        createMockModel({ id: 'Qwen/Qwen3-32B' }),
        createMockModel({ id: 'DeepSeek/DeepSeek-R1' }),
        createMockModel({ id: 'Mistral/Mistral-Small' }),
      ];

      registry.registerAll(models);

      expect(registry.size()).toBe(3);
    });

    it('should overwrite existing model with same ID', () => {
      const registry = new ModelRegistry();
      const model1 = createMockModel({ id: 'Qwen/Qwen3-32B', owned_by: 'sglang' });
      const model2 = createMockModel({ id: 'Qwen/Qwen3-32B', owned_by: 'vllm' });

      registry.register(model1);
      registry.register(model2);

      expect(registry.size()).toBe(1);
      expect(registry.get('Qwen/Qwen3-32B')?.owned_by).toBe('vllm');
    });
  });

  describe('unregister', () => {
    it('should remove a model', () => {
      const registry = new ModelRegistry();
      const model = createMockModel();

      registry.register(model);
      expect(registry.size()).toBe(1);

      const result = registry.unregister('Qwen/Qwen3-32B');
      expect(result).toBe(true);
      expect(registry.size()).toBe(0);
    });

    it('should return false for non-existent model', () => {
      const registry = new ModelRegistry();

      const result = registry.unregister('NonExistent/Model');
      expect(result).toBe(false);
    });
  });

  describe('display ID conversion', () => {
    it('should generate correct display ID', () => {
      const registry = new ModelRegistry();
      registry.setPrefix('chutes');

      expect(registry.getDisplayId('Qwen/Qwen3-32B')).toBe('chutes/Qwen/Qwen3-32B');
    });

    it('should extract original ID from display ID', () => {
      const registry = new ModelRegistry();
      registry.setPrefix('chutes');

      expect(registry.getOriginalId('chutes/Qwen/Qwen3-32B')).toBe('Qwen/Qwen3-32B');
      expect(registry.getOriginalId('NotChutes/Model')).toBeUndefined();
    });

    it('should identify chutes models correctly', () => {
      const registry = new ModelRegistry();
      registry.setPrefix('chutes');

      expect(registry.isChutesModel('chutes/Qwen/Qwen3-32B')).toBe(true);
      expect(registry.isChutesModel('Qwen/Qwen3-32B')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all models as array', () => {
      const registry = new ModelRegistry();
      const models = [
        createMockModel({ id: 'A/A' }),
        createMockModel({ id: 'B/B' }),
        createMockModel({ id: 'C/C' }),
      ];

      registry.registerAll(models);
      const all = registry.getAll();

      expect(all).toHaveLength(3);
    });
  });

  describe('getAllDisplayInfo', () => {
    it('should return all display info as array', () => {
      const registry = new ModelRegistry();
      const models = [createMockModel({ id: 'A/A' }), createMockModel({ id: 'B/B' })];

      registry.registerAll(models);
      const allDisplayInfo = registry.getAllDisplayInfo();

      expect(allDisplayInfo).toHaveLength(2);
      expect(allDisplayInfo[0].id).toBe('chutes/A/A');
      expect(allDisplayInfo[1].id).toBe('chutes/B/B');
    });
  });

  describe('filter', () => {
    it('should filter models by predicate', () => {
      const registry = new ModelRegistry();
      registry.registerAll([
        createMockModel({ id: 'A/A', owned_by: 'sglang' }),
        createMockModel({ id: 'B/B', owned_by: 'vllm' }),
        createMockModel({ id: 'C/C', owned_by: 'sglang' }),
      ]);

      const sglangModels = registry.filter((m) => m.owned_by === 'sglang');

      expect(sglangModels).toHaveLength(2);
    });
  });

  describe('findByFeature', () => {
    it('should find models with specific feature', () => {
      const registry = new ModelRegistry();
      registry.registerAll([
        createMockModel({ id: 'A/A', supported_features: ['json_mode'] }),
        createMockModel({ id: 'B/B', supported_features: ['tools'] }),
        createMockModel({ id: 'C/C', supported_features: ['json_mode', 'tools'] }),
      ]);

      const jsonModels = registry.findByFeature('json_mode');

      expect(jsonModels).toHaveLength(2);
    });

    it('should handle models without supported_features', () => {
      const registry = new ModelRegistry();
      registry.registerAll([
        createMockModel({ id: 'A/A', supported_features: ['json_mode'] }),
        createMockModel({ id: 'B/B', supported_features: undefined }), // API might return undefined
      ]);

      const allDisplayInfo = registry.getAllDisplayInfo();
      expect(allDisplayInfo).toHaveLength(2);
      expect(allDisplayInfo[0].features).toEqual(['json_mode']);
      expect(allDisplayInfo[1].features).toEqual([]); // Should default to empty array
    });
  });

  describe('findByOwner', () => {
    it('should find models by owner', () => {
      const registry = new ModelRegistry();
      registry.registerAll([
        createMockModel({ id: 'A/A', owned_by: 'sglang' }),
        createMockModel({ id: 'B/B', owned_by: 'vllm' }),
        createMockModel({ id: 'C/C', owned_by: 'sglang' }),
      ]);

      const sglangModels = registry.findByOwner('sglang');

      expect(sglangModels).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('should clear all models', () => {
      const registry = new ModelRegistry();
      registry.registerAll([createMockModel({ id: 'A/A' }), createMockModel({ id: 'B/B' })]);

      expect(registry.size()).toBe(2);

      registry.clear();

      expect(registry.size()).toBe(0);
    });
  });

  describe('getDisplayInfo', () => {
    it('should return display info for registered model', () => {
      const registry = new ModelRegistry();
      registry.register(createMockModel({ id: 'Qwen/Qwen3-32B' }));

      const displayInfo = registry.getDisplayInfo('chutes/Qwen/Qwen3-32B');

      expect(displayInfo).toBeDefined();
      expect(displayInfo?.originalId).toBe('Qwen/Qwen3-32B');
      expect(displayInfo?.ownedBy).toBe('sglang');
      expect(displayInfo?.pricing.promptPer1M).toBe(0.08);
    });

    it('should return undefined for non-existent model', () => {
      const registry = new ModelRegistry();

      const displayInfo = registry.getDisplayInfo('chutes/NonExistent/Model');

      expect(displayInfo).toBeUndefined();
    });
  });
});
