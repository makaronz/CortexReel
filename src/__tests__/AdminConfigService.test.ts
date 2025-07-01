import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdminConfigService } from '../services/AdminConfigService';
import type { LLMConfig, PromptConfig, AppConfig } from '../types/analysis';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  }
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('AdminConfigService', () => {
  let adminConfigService: AdminConfigService;

  beforeEach(() => {
    adminConfigService = new AdminConfigService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of AdminConfigService', () => {
      expect(adminConfigService).toBeInstanceOf(AdminConfigService);
    });

    it('should have the correct CONFIG_STORAGE_KEY', () => {
      // Access private property through bracket notation for testing
      expect((adminConfigService as any).CONFIG_STORAGE_KEY).toBe('cortexreel_admin_config');
    });
  });

  describe('getLLMConfig', () => {
    it('should return stored LLM config when localStorage has data', async () => {
      const mockStoredConfig: LLMConfig = {
        apiKey: 'stored-api-key',
        model: 'stored-model',
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.8,
        topK: 20,
        presencePenalty: 0.1,
        frequencyPenalty: 0.2
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStoredConfig));

      const result = await adminConfigService.getLLMConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_llm');
      expect(result).toEqual(mockStoredConfig);
    });

    it('should return default config when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getLLMConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_llm');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_llm',
        expect.stringContaining('google/gemini-2.5-flash')
      );
      expect(result).toEqual({
        apiKey: 'test-api-key',
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      });
    });

    it('should handle JSON parsing errors gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = await adminConfigService.getLLMConfig();

      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching LLM config:', expect.any(SyntaxError));
      expect(result).toEqual({
        apiKey: 'test-api-key',
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      });
    });

    it('should handle localStorage access errors', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const result = await adminConfigService.getLLMConfig();

      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching LLM config:', expect.any(Error));
      expect(result).toEqual({
        apiKey: 'test-api-key',
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      });
    });

    it('should use empty string for apiKey when env var is not set', async () => {
      vi.stubGlobal('import.meta', {
        env: {}
      });
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getLLMConfig();

      expect(result.apiKey).toBe('');
    });
  });

  describe('saveLLMConfig', () => {
    it('should save valid LLM config to localStorage', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'new-api-key',
        model: 'new-model',
        temperature: 0.8,
        maxTokens: 2000,
        topP: 0.95,
        topK: 50,
        presencePenalty: 0.2,
        frequencyPenalty: 0.3
      };

      await adminConfigService.saveLLMConfig(mockConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_llm',
        JSON.stringify(mockConfig)
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('LLM configuration saved successfully');
    });

    it('should call updateEnvFile when saving LLM config', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      await adminConfigService.saveLLMConfig(mockConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_env',
        expect.stringContaining('VITE_GEMINI_API_KEY')
      );
    });

    it('should handle localStorage write errors', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });

      await expect(adminConfigService.saveLLMConfig(mockConfig)).rejects.toThrow('localStorage write error');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving LLM config:', expect.any(Error));
    });

    it('should handle JSON stringification edge cases', async () => {
      const configWithUndefined = {
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0,
        invalidProp: undefined
      } as any;

      await adminConfigService.saveLLMConfig(configWithUndefined);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      expect(savedData).not.toContain('invalidProp');
    });
  });

  describe('getPromptConfig', () => {
    it('should return stored prompt config when localStorage has data', async () => {
      const mockPromptConfig = {
        fullAnalysis: {
          id: 'fullAnalysis',
          name: 'Test Analysis',
          version: '1.0.0',
          description: 'Test description',
          prompt: 'Test prompt'
        }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPromptConfig));

      const result = await adminConfigService.getPromptConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_prompts');
      expect(result).toEqual(mockPromptConfig);
    });

    it('should return default prompts when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getPromptConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_prompts');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_prompts',
        expect.any(String)
      );
      expect(result).toHaveProperty('fullAnalysis');
      expect(result).toHaveProperty('sceneStructure');
      expect(result).toHaveProperty('characters');
      expect(result.fullAnalysis).toHaveProperty('id', 'fullAnalysis');
      expect(result.fullAnalysis).toHaveProperty('name', 'Pełna Analiza Scenariusza');
    });

    it('should handle JSON parsing errors and return defaults', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = await adminConfigService.getPromptConfig();

      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching prompt config:', expect.any(SyntaxError));
      expect(result).toHaveProperty('fullAnalysis');
      expect(result).toHaveProperty('sceneStructure');
    });

    it('should validate default prompt structure', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getPromptConfig();

      // Validate all required prompt templates exist
      const requiredPrompts = ['fullAnalysis', 'sceneStructure', 'characters', 'locations', 'themes', 'emotionalArcs', 'safety'];
      
      requiredPrompts.forEach(promptKey => {
        expect(result).toHaveProperty(promptKey);
        expect(result[promptKey]).toHaveProperty('id');
        expect(result[promptKey]).toHaveProperty('name');
        expect(result[promptKey]).toHaveProperty('version');
        expect(result[promptKey]).toHaveProperty('description');
        expect(result[promptKey]).toHaveProperty('prompt');
      });
    });
  });

  describe('savePromptConfig', () => {
    it('should save valid prompt config to localStorage', async () => {
      const mockPromptConfig: PromptConfig = {
        fullAnalysis: {
          id: 'fullAnalysis',
          name: 'Updated Analysis',
          version: '2.0.0',
          description: 'Updated description',
          prompt: 'Updated prompt'
        },
        sceneStructure: {
          id: 'sceneStructure',
          name: 'Scene Structure',
          version: '1.0.0',
          description: 'Scene analysis',
          prompt: 'Scene prompt'
        },
        characters: {
          id: 'characters',
          name: 'Characters',
          version: '1.0.0',
          description: 'Character analysis',
          prompt: 'Character prompt'
        },
        locations: {
          id: 'locations',
          name: 'Locations',
          version: '1.0.0',
          description: 'Location analysis',
          prompt: 'Location prompt'
        },
        themes: {
          id: 'themes',
          name: 'Themes',
          version: '1.0.0',
          description: 'Theme analysis',
          prompt: 'Theme prompt'
        },
        emotionalArcs: {
          id: 'emotionalArcs',
          name: 'Emotional Arcs',
          version: '1.0.0',
          description: 'Emotional analysis',
          prompt: 'Emotional prompt'
        },
        safety: {
          id: 'safety',
          name: 'Safety',
          version: '1.0.0',
          description: 'Safety analysis',
          prompt: 'Safety prompt'
        }
      };

      await adminConfigService.savePromptConfig(mockPromptConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_prompts',
        JSON.stringify(mockPromptConfig)
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('Prompt configuration saved successfully');
    });

    it('should handle localStorage write errors', async () => {
      const mockPromptConfig = {} as PromptConfig;
      
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });

      await expect(adminConfigService.savePromptConfig(mockPromptConfig)).rejects.toThrow('localStorage write error');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving prompt config:', expect.any(Error));
    });
  });

  describe('getAppConfig', () => {
    it('should return stored app config when localStorage has data', async () => {
      const mockAppConfig: AppConfig = {
        appName: 'Custom App',
        maxFileSize: 20971520,
        supportedFormats: 'pdf,txt,docx',
        debugMode: true,
        logLevel: 'debug',
        enableOCR: false,
        enableAdvancedCharts: false,
        enableExport: false,
        enableCollaboration: true
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAppConfig));

      const result = await adminConfigService.getAppConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_app');
      expect(result).toEqual(mockAppConfig);
    });

    it('should return default app config when localStorage is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getAppConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_app');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_app',
        expect.stringContaining('CortexReel')
      );
      expect(result).toEqual({
        appName: 'CortexReel',
        maxFileSize: 10485760,
        supportedFormats: 'pdf,txt',
        debugMode: false,
        logLevel: 'info',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: false
      });
    });

    it('should handle JSON parsing errors and return defaults', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = await adminConfigService.getAppConfig();

      expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching app config:', expect.any(SyntaxError));
      expect(result.appName).toBe('CortexReel');
      expect(result.maxFileSize).toBe(10485760);
    });

    it('should validate default app config structure', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await adminConfigService.getAppConfig();

      expect(result).toHaveProperty('appName');
      expect(result).toHaveProperty('maxFileSize');
      expect(result).toHaveProperty('supportedFormats');
      expect(result).toHaveProperty('debugMode');
      expect(result).toHaveProperty('logLevel');
      expect(result).toHaveProperty('enableOCR');
      expect(result).toHaveProperty('enableAdvancedCharts');
      expect(result).toHaveProperty('enableExport');
      expect(result).toHaveProperty('enableCollaboration');
      
      expect(typeof result.appName).toBe('string');
      expect(typeof result.maxFileSize).toBe('number');
      expect(typeof result.debugMode).toBe('boolean');
    });
  });

  describe('saveAppConfig', () => {
    it('should save valid app config to localStorage', async () => {
      const mockAppConfig: AppConfig = {
        appName: 'Updated App',
        maxFileSize: 15728640,
        supportedFormats: 'pdf,txt,docx,xlsx',
        debugMode: true,
        logLevel: 'debug',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: true
      };

      await adminConfigService.saveAppConfig(mockAppConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_app',
        JSON.stringify(mockAppConfig)
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('App configuration saved successfully');
    });

    it('should handle localStorage write errors', async () => {
      const mockAppConfig = {} as AppConfig;
      
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage write error');
      });

      await expect(adminConfigService.saveAppConfig(mockAppConfig)).rejects.toThrow('localStorage write error');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving app config:', expect.any(Error));
    });
  });

  describe('getDefaultPrompts', () => {
    it('should return complete default prompt configuration', () => {
      const defaultPrompts = adminConfigService.getDefaultPrompts();

      expect(defaultPrompts).toHaveProperty('fullAnalysis');
      expect(defaultPrompts).toHaveProperty('sceneStructure');
      expect(defaultPrompts).toHaveProperty('characters');
      expect(defaultPrompts).toHaveProperty('locations');
      expect(defaultPrompts).toHaveProperty('themes');
      expect(defaultPrompts).toHaveProperty('emotionalArcs');
      expect(defaultPrompts).toHaveProperty('safety');
    });

    it('should return prompts with correct structure', () => {
      const defaultPrompts = adminConfigService.getDefaultPrompts();

      Object.values(defaultPrompts).forEach(prompt => {
        expect(prompt).toHaveProperty('id');
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('version');
        expect(prompt).toHaveProperty('description');
        expect(prompt).toHaveProperty('prompt');
        
        expect(typeof prompt.id).toBe('string');
        expect(typeof prompt.name).toBe('string');
        expect(typeof prompt.version).toBe('string');
        expect(typeof prompt.description).toBe('string');
        expect(typeof prompt.prompt).toBe('string');
        
        expect(prompt.id.length).toBeGreaterThan(0);
        expect(prompt.prompt.length).toBeGreaterThan(0);
      });
    });

    it('should include Polish language prompts', () => {
      const defaultPrompts = adminConfigService.getDefaultPrompts();

      expect(defaultPrompts.fullAnalysis.name).toContain('Pełna');
      expect(defaultPrompts.sceneStructure.name).toContain('MEGA PROMPT');
      expect(defaultPrompts.characters.name).toContain('Analiza Postaci');
    });
  });

  describe('clearAllConfiguration', () => {
    it('should remove all configuration items from localStorage', async () => {
      await adminConfigService.clearAllConfiguration();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cortexreel_admin_config_llm');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cortexreel_admin_config_prompts');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cortexreel_admin_config_app');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cortexreel_admin_config_env');
      expect(consoleSpy.log).toHaveBeenCalledWith('🧹 All admin configuration cleared - defaults will be reloaded');
    });

    it('should handle localStorage removal errors', async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage removal error');
      });

      await expect(adminConfigService.clearAllConfiguration()).rejects.toThrow('localStorage removal error');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error clearing configuration:', expect.any(Error));
    });
  });

  describe('resetToNewDefaults', () => {
    it('should clear configuration and reload defaults', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await adminConfigService.resetToNewDefaults();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4);
      expect(consoleSpy.log).toHaveBeenCalledWith('🔄 Configuration reset to new defaults (Gemini 2.5 Flash + MEGA PROMPT)');
    });

    it('should handle reset errors gracefully', async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Reset error');
      });

      await expect(adminConfigService.resetToNewDefaults()).rejects.toThrow('Reset error');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error resetting to new defaults:', expect.any(Error));
    });

    it('should reload all configuration types after reset', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await adminConfigService.resetToNewDefaults();

      // Should have called getItem for each config type during reload
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_llm');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_prompts');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('cortexreel_admin_config_app');
    });
  });

  describe('updateEnvFile (private method)', () => {
    it('should log environment variable updates', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'new-env-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      await adminConfigService.saveLLMConfig(mockConfig);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        'Environment variable VITE_GEMINI_API_KEY would be updated to: new-env-key'
      );
    });

    it('should store env changes in localStorage', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'test-env-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      localStorageMock.getItem.mockReturnValue('{}');

      await adminConfigService.saveLLMConfig(mockConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_env',
        expect.stringContaining('VITE_GEMINI_API_KEY')
      );
    });

    it('should handle existing env changes in localStorage', async () => {
      const existingEnvChanges = JSON.stringify({ OTHER_KEY: 'other-value' });
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'cortexreel_admin_config_env') return existingEnvChanges;
        return null;
      });

      const mockConfig: LLMConfig = {
        apiKey: 'new-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      await adminConfigService.saveLLMConfig(mockConfig);

      const lastCall = localStorageMock.setItem.mock.calls.find(call => 
        call[0] === 'cortexreel_admin_config_env'
      );
      expect(lastCall).toBeDefined();
      
      const savedEnvData = JSON.parse(lastCall![1]);
      expect(savedEnvData).toHaveProperty('OTHER_KEY', 'other-value');
      expect(savedEnvData).toHaveProperty('VITE_GEMINI_API_KEY', 'new-key');
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle localStorage quota exceeded error', async () => {
      const mockConfig: LLMConfig = {
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError;
      });

      await expect(adminConfigService.saveLLMConfig(mockConfig)).rejects.toThrow('QuotaExceededError');
    });

    it('should handle localStorage disabled/unavailable', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: null
      });

      // Should not throw when localStorage is null
      const service = new AdminConfigService();
      expect(service).toBeInstanceOf(AdminConfigService);
    });

    it('should handle very large configuration objects', async () => {
      const largeConfig: LLMConfig = {
        apiKey: 'x'.repeat(100000), // Very long API key
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      await adminConfigService.saveLLMConfig(largeConfig);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_llm',
        expect.stringContaining('x'.repeat(100000))
      );
    });

    it('should handle config with special characters', async () => {
      const configWithSpecialChars: LLMConfig = {
        apiKey: 'key-with-émojis-🚀-and-ñeeds',
        model: 'model/with/slashes',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      await adminConfigService.saveLLMConfig(configWithSpecialChars);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cortexreel_admin_config_llm',
        expect.stringContaining('key-with-émojis-🚀-and-ñeeds')
      );
    });

    it('should handle concurrent operations', async () => {
      const config1: LLMConfig = {
        apiKey: 'key1',
        model: 'model1',
        temperature: 0.1,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };

      const config2: AppConfig = {
        appName: 'App2',
        maxFileSize: 2000000,
        supportedFormats: 'pdf',
        debugMode: true,
        logLevel: 'debug',
        enableOCR: false,
        enableAdvancedCharts: false,
        enableExport: false,
        enableCollaboration: false
      };

      localStorageMock.getItem.mockReturnValue(null);

      const promises = [
        adminConfigService.saveLLMConfig(config1),
        adminConfigService.saveAppConfig(config2),
        adminConfigService.getLLMConfig(),
        adminConfigService.getAppConfig()
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(6); // 2 saves + 2 default saves from gets
    });
  });

  describe('integration tests', () => {
    it('should maintain data consistency across save and load operations', async () => {
      const testConfig: LLMConfig = {
        apiKey: 'integration-test-key',
        model: 'integration-model',
        temperature: 0.75,
        maxTokens: 4096,
        topP: 0.85,
        topK: 35,
        presencePenalty: 0.1,
        frequencyPenalty: 0.05
      };

      // Save config
      await adminConfigService.saveLLMConfig(testConfig);

      // Mock localStorage to return the saved config
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testConfig));

      // Load config
      const loadedConfig = await adminConfigService.getLLMConfig();

      expect(loadedConfig).toEqual(testConfig);
    });

    it('should handle full application lifecycle', async () => {
      // Start with empty localStorage
      localStorageMock.getItem.mockReturnValue(null);

      // Load defaults
      const defaultLLM = await adminConfigService.getLLMConfig();
      const defaultPrompts = await adminConfigService.getPromptConfig();
      const defaultApp = await adminConfigService.getAppConfig();

      expect(defaultLLM.model).toBe('google/gemini-2.5-flash');
      expect(defaultPrompts.fullAnalysis.id).toBe('fullAnalysis');
      expect(defaultApp.appName).toBe('CortexReel');

      // Clear all configuration
      await adminConfigService.clearAllConfiguration();

      // Reset to new defaults
      await adminConfigService.resetToNewDefaults();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(8); // 4 for clear + 4 for reset
    });
  });
});