import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdminDashboard from '../views/AdminDashboard';
import { AdminConfigService } from '../services/AdminConfigService';

// Mock the AdminConfigService
jest.mock('../services/AdminConfigService');
const MockedAdminConfigService = AdminConfigService as jest.MockedClass<typeof AdminConfigService>;

// Mock LoadingOverlay component
jest.mock('../components/LoadingOverlay', () => {
  return function MockLoadingOverlay({ loading }: { loading: boolean }) {
    return loading ? <div data-testid="loading-overlay">Loading...</div> : null;
  };
});

describe('AdminDashboard', () => {
  let mockConfigService: jest.Mocked<AdminConfigService>;

  const mockLLMConfig = {
    apiKey: 'test-api-key',
    model: 'google/gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    topK: 40,
    presencePenalty: 0,
    frequencyPenalty: 0
  };

  const mockPromptConfig = {
    'analysis': {
      id: 'analysis',
      name: 'Film Analysis',
      prompt: 'Analyze the following film...',
      version: '1.0',
      description: 'Main film analysis prompt'
    },
    'summary': {
      id: 'summary',
      name: 'Summary Generation',
      prompt: 'Generate a summary...',
      version: '1.1',
      description: 'Summary generation prompt'
    }
  };

  const mockAppConfig = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock instance
    mockConfigService = {
      getLLMConfig: jest.fn().mockResolvedValue(mockLLMConfig),
      getPromptConfig: jest.fn().mockResolvedValue(mockPromptConfig),
      getAppConfig: jest.fn().mockResolvedValue(mockAppConfig),
      saveLLMConfig: jest.fn().mockResolvedValue(undefined),
      savePromptConfig: jest.fn().mockResolvedValue(undefined),
      saveAppConfig: jest.fn().mockResolvedValue(undefined),
      resetToNewDefaults: jest.fn().mockResolvedValue(undefined),
      getDefaultPrompts: jest.fn().mockReturnValue(mockPromptConfig)
    } as any;

    // Mock the constructor to return our mock instance
    MockedAdminConfigService.mockImplementation(() => mockConfigService);
  });

  describe('Component Rendering', () => {
    test('renders admin dashboard with main heading', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Panel Administracyjny')).toBeInTheDocument();
      });
    });

    test('renders all three tabs', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Konfiguracja LLM')).toBeInTheDocument();
        expect(screen.getByText('Prompty')).toBeInTheDocument();
        expect(screen.getByText('Ustawienia Aplikacji')).toBeInTheDocument();
      });
    });

    test('shows loading overlay during initial load', () => {
      render(<AdminDashboard />);
      
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    test('hides loading overlay after data loads', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    test('loads all configurations on mount', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(mockConfigService.getLLMConfig).toHaveBeenCalled();
        expect(mockConfigService.getPromptConfig).toHaveBeenCalled();
        expect(mockConfigService.getAppConfig).toHaveBeenCalled();
      });
    });

    test('displays success message after successful load', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Konfiguracja załadowana pomyślnie')).toBeInTheDocument();
      });
    });

    test('handles loading errors gracefully', async () => {
      mockConfigService.getLLMConfig.mockRejectedValue(new Error('Load failed'));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Błąd podczas ładowania konfiguracji')).toBeInTheDocument();
      });
    });

    test('displays loaded LLM configuration data', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('test-api-key')).toBeInTheDocument();
        expect(screen.getByDisplayValue('google/gemini-2.5-flash')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('switches to prompts tab when clicked', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      expect(screen.getByText('Zarządzanie Promptami')).toBeInTheDocument();
    });

    test('switches to app settings tab when clicked', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      expect(screen.getByText('Ustawienia Aplikacji')).toBeInTheDocument();
    });

    test('maintains active tab state', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      // Tab should have selected attributes
      const selectedTab = screen.getByRole('tab', { selected: true });
      expect(selectedTab).toHaveTextContent('Prompty');
    });
  });

  describe('LLM Configuration Tab', () => {
    test('updates API key field', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const apiKeyInput = screen.getByLabelText('Klucz API');
        expect(apiKeyInput).toBeInTheDocument();
      });
      
      const apiKeyInput = screen.getByLabelText('Klucz API');
      await user.clear(apiKeyInput);
      await user.type(apiKeyInput, 'new-api-key');
      
      expect(apiKeyInput).toHaveValue('new-api-key');
    });

    test('updates model selection', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const modelSelect = screen.getByLabelText('Model LLM');
        expect(modelSelect).toBeInTheDocument();
      });
      
      const modelSelect = screen.getByLabelText('Model LLM');
      fireEvent.mouseDown(modelSelect);
      
      const newModel = screen.getByText('openai/gpt-4o');
      fireEvent.click(newModel);
      
      expect(modelSelect).toHaveTextContent('openai/gpt-4o');
    });

    test('updates temperature slider', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const temperatureSlider = screen.getByRole('slider', { name: /temperatura/i });
        expect(temperatureSlider).toBeInTheDocument();
      });
      
      const temperatureSlider = screen.getByRole('slider', { name: /temperatura/i });
      fireEvent.change(temperatureSlider, { target: { value: 1.2 } });
      
      expect(screen.getByText('Temperatura: 1.2')).toBeInTheDocument();
    });

    test('updates max tokens field', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const maxTokensInput = screen.getByLabelText('Maksymalna liczba tokenów');
        expect(maxTokensInput).toBeInTheDocument();
      });
      
      const maxTokensInput = screen.getByLabelText('Maksymalna liczba tokenów');
      await user.clear(maxTokensInput);
      await user.type(maxTokensInput, '8192');
      
      expect(maxTokensInput).toHaveValue(8192);
    });

    test('saves LLM configuration', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Zapisz Konfigurację LLM');
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockConfigService.saveLLMConfig).toHaveBeenCalledWith(mockLLMConfig);
        expect(screen.getByText('Konfiguracja zapisana pomyślnie')).toBeInTheDocument();
      });
    });

    test('handles save errors', async () => {
      mockConfigService.saveLLMConfig.mockRejectedValue(new Error('Save failed'));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Zapisz Konfigurację LLM');
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Błąd podczas zapisywania konfiguracji')).toBeInTheDocument();
      });
    });

    test('resets to new defaults', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const resetButton = screen.getByText('🎬 Reset do Nowych Domyślnych');
        fireEvent.click(resetButton);
      });
      
      await waitFor(() => {
        expect(mockConfigService.resetToNewDefaults).toHaveBeenCalled();
        expect(screen.getByText(/🎬 Konfiguracja zresetowana/)).toBeInTheDocument();
      });
    });
  });

  describe('Prompts Management Tab', () => {
    test('displays prompt accordions', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Film Analysis')).toBeInTheDocument();
        expect(screen.getByText('Summary Generation')).toBeInTheDocument();
      });
    });

    test('expands prompt accordion when clicked', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      await waitFor(() => {
        const analysisPrompt = screen.getByText('Film Analysis');
        fireEvent.click(analysisPrompt);
      });
      
      expect(screen.getByDisplayValue('Analyze the following film...')).toBeInTheDocument();
    });

    test('updates prompt content', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      await waitFor(() => {
        const analysisPrompt = screen.getByText('Film Analysis');
        fireEvent.click(analysisPrompt);
      });
      
      const promptTextarea = screen.getByDisplayValue('Analyze the following film...');
      await user.clear(promptTextarea);
      await user.type(promptTextarea, 'New prompt content');
      
      expect(promptTextarea).toHaveValue('New prompt content');
    });

    test('saves all prompts', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      await waitFor(() => {
        const saveButton = screen.getByText('Zapisz Wszystkie Prompty');
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockConfigService.savePromptConfig).toHaveBeenCalled();
      });
    });

    test('resets prompt to default', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      await waitFor(() => {
        const analysisPrompt = screen.getByText('Film Analysis');
        fireEvent.click(analysisPrompt);
      });
      
      const resetButton = screen.getByText('Przywróć Domyślny');
      fireEvent.click(resetButton);
      
      expect(mockConfigService.getDefaultPrompts).toHaveBeenCalled();
    });
  });

  describe('App Settings Tab', () => {
    test('displays app configuration fields', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('CortexReel')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10485760')).toBeInTheDocument();
        expect(screen.getByDisplayValue('pdf,txt')).toBeInTheDocument();
      });
    });

    test('updates app name field', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      const appNameInput = screen.getByLabelText('Nazwa Aplikacji');
      await user.clear(appNameInput);
      await user.type(appNameInput, 'New App Name');
      
      expect(appNameInput).toHaveValue('New App Name');
    });

    test('toggles feature switches', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      const debugSwitch = screen.getByLabelText('Tryb debugowania');
      fireEvent.click(debugSwitch);
      
      expect(debugSwitch).toBeChecked();
    });

    test('updates log level selection', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      const logLevelSelect = screen.getByLabelText('Poziom logowania');
      fireEvent.mouseDown(logLevelSelect);
      
      const errorLevel = screen.getByText('ERROR');
      fireEvent.click(errorLevel);
      
      expect(logLevelSelect).toHaveTextContent('ERROR');
    });

    test('saves app configuration', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const appTab = screen.getByText('Ustawienia Aplikacji');
        fireEvent.click(appTab);
      });
      
      const saveButton = screen.getByText('Zapisz Ustawienia Aplikacji');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockConfigService.saveAppConfig).toHaveBeenCalledWith(mockAppConfig);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty prompt configuration', async () => {
      mockConfigService.getPromptConfig.mockResolvedValue({});
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const promptsTab = screen.getByText('Prompty');
        fireEvent.click(promptsTab);
      });
      
      // Should not crash with empty prompts
      expect(screen.getByText('Zarządzanie Promptami')).toBeInTheDocument();
    });

    test('handles invalid numeric inputs gracefully', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const maxTokensInput = screen.getByLabelText('Maksymalna liczba tokenów');
        expect(maxTokensInput).toBeInTheDocument();
      });
      
      const maxTokensInput = screen.getByLabelText('Maksymalna liczba tokenów');
      await user.clear(maxTokensInput);
      await user.type(maxTokensInput, 'invalid');
      
      // Input should handle invalid values
      expect(maxTokensInput).toHaveValue(null);
    });

    test('validates slider boundaries', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const temperatureSlider = screen.getByRole('slider', { name: /temperatura/i });
        expect(temperatureSlider).toBeInTheDocument();
      });
      
      const temperatureSlider = screen.getByRole('slider', { name: /temperatura/i });
      
      // Test minimum boundary
      fireEvent.change(temperatureSlider, { target: { value: -1 } });
      expect(temperatureSlider).toHaveValue('0');
      
      // Test maximum boundary
      fireEvent.change(temperatureSlider, { target: { value: 3 } });
      expect(temperatureSlider).toHaveValue('2');
    });

    test('handles network timeout errors', async () => {
      mockConfigService.getLLMConfig.mockRejectedValue(new Error('Network timeout'));
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Błąd podczas ładowania konfiguracji')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for tabs', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute('aria-controls');
          expect(tab).toHaveAttribute('id');
        });
      });
    });

    test('supports keyboard navigation', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const firstTab = screen.getAllByRole('tab')[0];
        firstTab.focus();
        expect(document.activeElement).toBe(firstTab);
      });
    });

    test('has proper form labels', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        const apiKeyInput = screen.getByLabelText('Klucz API');
        const modelSelect = screen.getByLabelText('Model LLM');
        
        expect(apiKeyInput).toBeInTheDocument();
        expect(modelSelect).toBeInTheDocument();
      });
    });
  });

  describe('Snackbar Notifications', () => {
    test('closes snackbar when close button is clicked', async () => {
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Konfiguracja załadowana pomyślnie')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Konfiguracja załadowana pomyślnie')).not.toBeInTheDocument();
      });
    });

    test('auto-hides snackbar after timeout', async () => {
      jest.useFakeTimers();
      
      render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Konfiguracja załadowana pomyślnie')).toBeInTheDocument();
      });
      
      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Konfiguracja załadowana pomyślnie')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});