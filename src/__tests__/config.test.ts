import { describe, it, expect } from 'vitest';
import { validateConfig, hasApiToken } from '../config/schema';
import type { ChutesPluginConfigInput } from '../config/schema';

describe('validateConfig', () => {
  describe('apiToken', () => {
    it('should accept valid apiToken', () => {
      const config = validateConfig({ apiToken: 'test-token-123' } as ChutesPluginConfigInput);
      expect(config.apiToken).toBe('test-token-123');
    });

    it('should reject empty apiToken', () => {
      expect(() => validateConfig({ apiToken: '' } as ChutesPluginConfigInput)).toThrow(
        'apiToken cannot be empty'
      );
    });

    it('should reject non-string apiToken', () => {
      expect(() => validateConfig({ apiToken: 123 } as unknown as ChutesPluginConfigInput)).toThrow(
        'apiToken must be a string'
      );
    });

    it('should allow undefined apiToken', () => {
      const config = validateConfig({} as ChutesPluginConfigInput);
      expect(config.apiToken).toBeUndefined();
    });
  });

  describe('autoRefresh', () => {
    it('should accept true', () => {
      const config = validateConfig({ autoRefresh: true } as ChutesPluginConfigInput);
      expect(config.autoRefresh).toBe(true);
    });

    it('should accept false', () => {
      const config = validateConfig({ autoRefresh: false } as ChutesPluginConfigInput);
      expect(config.autoRefresh).toBe(false);
    });

    it('should default to true', () => {
      const config = validateConfig({} as ChutesPluginConfigInput);
      expect(config.autoRefresh).toBe(true);
    });

    it('should reject non-boolean', () => {
      expect(() =>
        validateConfig({ autoRefresh: 'true' } as unknown as ChutesPluginConfigInput)
      ).toThrow('autoRefresh must be a boolean');
    });
  });

  describe('refreshInterval', () => {
    it('should accept valid interval', () => {
      const config = validateConfig({ refreshInterval: 7200 } as ChutesPluginConfigInput);
      expect(config.refreshInterval).toBe(7200);
    });

    it('should reject less than 60 seconds', () => {
      expect(() => validateConfig({ refreshInterval: 59 } as ChutesPluginConfigInput)).toThrow(
        'refreshInterval must be at least 60 seconds'
      );
    });

    it('should reject more than 86400 seconds', () => {
      expect(() => validateConfig({ refreshInterval: 86401 } as ChutesPluginConfigInput)).toThrow(
        'refreshInterval must be at most 86400 seconds (24 hours)'
      );
    });

    it('should default to 3600', () => {
      const config = validateConfig({} as ChutesPluginConfigInput);
      expect(config.refreshInterval).toBe(3600);
    });

    it('should reject non-number', () => {
      expect(() =>
        validateConfig({ refreshInterval: '3600' } as unknown as ChutesPluginConfigInput)
      ).toThrow('refreshInterval must be a number');
    });
  });

  describe('defaultModel', () => {
    it('should accept valid model ID', () => {
      const config = validateConfig({
        defaultModel: 'chutes/Qwen/Qwen3-32B',
      } as ChutesPluginConfigInput);
      expect(config.defaultModel).toBe('chutes/Qwen/Qwen3-32B');
    });

    it('should reject empty defaultModel', () => {
      expect(() => validateConfig({ defaultModel: '' } as ChutesPluginConfigInput)).toThrow(
        'defaultModel cannot be empty'
      );
    });

    it('should reject non-string', () => {
      expect(() =>
        validateConfig({ defaultModel: 123 } as unknown as ChutesPluginConfigInput)
      ).toThrow('defaultModel must be a string');
    });
  });

  describe('modelFilter', () => {
    it('should accept valid filter array', () => {
      const config = validateConfig({
        modelFilter: ['Qwen/*', 'DeepSeek/*'],
      } as ChutesPluginConfigInput);
      expect(config.modelFilter).toEqual(['Qwen/*', 'DeepSeek/*']);
    });

    it('should reject non-array', () => {
      expect(() =>
        validateConfig({ modelFilter: 'Qwen/*' } as unknown as ChutesPluginConfigInput)
      ).toThrow('modelFilter must be an array');
    });

    it('should reject non-string array values', () => {
      expect(() =>
        validateConfig({ modelFilter: ['Qwen/*', 123] } as unknown as ChutesPluginConfigInput)
      ).toThrow('modelFilter values must be strings');
    });
  });

  describe('full config', () => {
    it('should accept complete valid config', () => {
      const config = validateConfig({
        apiToken: 'test-token',
        autoRefresh: false,
        refreshInterval: 7200,
        defaultModel: 'chutes/Qwen/Qwen3-32B',
        modelFilter: ['Qwen/*'],
      } as ChutesPluginConfigInput);

      expect(config.apiToken).toBe('test-token');
      expect(config.autoRefresh).toBe(false);
      expect(config.refreshInterval).toBe(7200);
      expect(config.defaultModel).toBe('chutes/Qwen/Qwen3-32B');
      expect(config.modelFilter).toEqual(['Qwen/*']);
    });

    it('should apply defaults for missing optional fields', () => {
      const config = validateConfig({
        apiToken: 'test-token',
      } as ChutesPluginConfigInput);

      expect(config.autoRefresh).toBe(true);
      expect(config.refreshInterval).toBe(3600);
      expect(config.defaultModel).toBeUndefined();
      expect(config.modelFilter).toBeUndefined();
    });
  });
});

describe('hasApiToken', () => {
  it('should return true for valid token', () => {
    expect(hasApiToken({ apiToken: 'test-token', autoRefresh: true, refreshInterval: 3600 })).toBe(
      true
    );
  });

  it('should return false for undefined token', () => {
    expect(hasApiToken({ apiToken: undefined, autoRefresh: true, refreshInterval: 3600 })).toBe(
      false
    );
  });

  it('should return false for empty token', () => {
    expect(hasApiToken({ apiToken: '', autoRefresh: true, refreshInterval: 3600 })).toBe(false);
  });

  it('should return false for whitespace-only token', () => {
    expect(hasApiToken({ apiToken: '   ', autoRefresh: true, refreshInterval: 3600 })).toBe(false);
  });
});
