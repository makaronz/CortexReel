import type { LLMConfig, PromptConfig, AppConfig } from '@/types/analysis';

export class AdminConfigService {
  private readonly CONFIG_STORAGE_KEY = 'cortexreel_admin_config';

  /**
   * Get current LLM configuration
   */
  async getLLMConfig(): Promise<LLMConfig> {
    try {
      // Try to get from localStorage first
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_llm`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default configuration with current env values
      const defaultConfig = {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536, // Gemini 2.5 Flash maximum output tokens
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };
      
      // Save default to localStorage
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_llm`, JSON.stringify(defaultConfig));
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching LLM config:', error);
      // Return default configuration if fetch fails
      return {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536, // Gemini 2.5 Flash maximum output tokens
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };
    }
  }

  /**
   * Save LLM configuration
   */
  async saveLLMConfig(config: LLMConfig): Promise<void> {
    try {
      // Save to localStorage
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_llm`, JSON.stringify(config));
      
      // Also update environment variables in .env.local file
      await this.updateEnvFile('VITE_GEMINI_API_KEY', config.apiKey);
      
      console.log('LLM configuration saved successfully');
    } catch (error) {
      console.error('Error saving LLM config:', error);
      throw error;
    }
  }

  /**
   * Get current prompt configurations
   */
  async getPromptConfig(): Promise<PromptConfig> {
    try {
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_prompts`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default prompts and save them
      const defaultPrompts = await this.getDefaultPrompts();
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_prompts`, JSON.stringify(defaultPrompts));
      return defaultPrompts;
    } catch (error) {
      console.error('Error fetching prompt config:', error);
      // Return default prompts if fetch fails
      return await this.getDefaultPrompts();
    }
  }

  /**
   * Save prompt configurations
   */
  async savePromptConfig(config: PromptConfig): Promise<void> {
    try {
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_prompts`, JSON.stringify(config));
      console.log('Prompt configuration saved successfully');
    } catch (error) {
      console.error('Error saving prompt config:', error);
      throw error;
    }
  }

  /**
   * Get current app configuration
   */
  async getAppConfig(): Promise<AppConfig> {
    try {
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_app`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default configuration and save it
      const defaultConfig = {
        appName: 'CortexReel',
        maxFileSize: 10485760,
        supportedFormats: 'pdf,txt',
        debugMode: false,
        logLevel: 'info',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: false
      };
      
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_app`, JSON.stringify(defaultConfig));
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching app config:', error);
      // Return default configuration if fetch fails
      return {
        appName: 'CortexReel',
        maxFileSize: 10485760,
        supportedFormats: 'pdf,txt',
        debugMode: false,
        logLevel: 'info',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: false
      };
    }
  }

  /**
   * Save app configuration
   */
  async saveAppConfig(config: AppConfig): Promise<void> {
    try {
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_app`, JSON.stringify(config));
      console.log('App configuration saved successfully');
    } catch (error) {
      console.error('Error saving app config:', error);
      throw error;
    }
  }

  /**
   * Update environment file with new values
   */
  private async updateEnvFile(key: string, value: string): Promise<void> {
    try {
      // In a real application, this would make an API call to update the .env.local file
      // For now, we'll just log the change and store it in localStorage
      console.log(`Environment variable ${key} would be updated to: ${value}`);
      
      // Store env changes in localStorage for now
      const envChanges = JSON.parse(localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_env`) || '{}');
      envChanges[key] = value;
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_env`, JSON.stringify(envChanges));
      
      // In a production environment, you would need a backend service to actually write to .env.local
      // This could be done via a Node.js API endpoint that writes to the file system
    } catch (error) {
      console.error('Error updating environment file:', error);
      throw error;
    }
  }

  /**
   * Get default prompt configurations
   * Now loads from external JSON file for better maintainability
   */
  async getDefaultPrompts(): Promise<PromptConfig> {
    // Load prompts from external file for better maintainability
    const { loadDefaultPrompts } = await import('./prompts/promptLoader');
    return await loadDefaultPrompts();
  }

  /**
   * Clear all stored configuration and force reload of defaults
   * Used when updating default configurations
   */
  async clearAllConfiguration(): Promise<void> {
    try {
      // Clear all localStorage entries
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_llm`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_prompts`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_app`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_env`);
      
      console.log('🧹 All admin configuration cleared - defaults will be reloaded');
    } catch (error) {
      console.error('Error clearing configuration:', error);
      throw error;
    }
  }

  /**
   * Reset to new default LLM configuration (Gemini 2.5 Flash)
   */
  async resetToNewDefaults(): Promise<void> {
    try {
      // Clear old configuration
      await this.clearAllConfiguration();
      
      // Force reload new defaults
      await this.getLLMConfig();
      await this.getPromptConfig();
      await this.getAppConfig();
      
      console.log('🔄 Configuration reset to new defaults (Gemini 2.5 Flash + MEGA PROMPT)');
    } catch (error) {
      console.error('Error resetting to new defaults:', error);
      throw error;
    }
  }
} 