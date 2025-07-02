import { describe, it, expect, vi, beforeEach, afterEach, MockedClass } from 'vitest';
import { GeminiAnalysisService } from '../services/geminiService';
import { AdminConfigService } from '../services/AdminConfigService';
import type { CompleteAnalysis, AnalysisProgress } from '../types/analysis';

// Mock the AdminConfigService
vi.mock('../services/AdminConfigService');

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  
  constructor(public url: string | URL, public options?: WorkerOptions) {}
  
  postMessage(message: any): void {
    // Mock implementation - can be overridden in tests
  }
  
  terminate(): void {
    // Mock implementation
  }
}

// Mock the Worker constructor
global.Worker = MockWorker as any;

// Mock URL constructor for import.meta.url
global.URL = vi.fn().mockImplementation((url: string, base?: string) => ({
  href: url,
  toString: () => url
})) as any;

describe('GeminiAnalysisService', () => {
  let geminiService: GeminiAnalysisService;
  let mockAdminConfigService: vi.Mocked<AdminConfigService>;
  let mockProgressCallback: vi.Mock;
  let mockPartialResultCallback: vi.Mock;

  const mockLLMConfig = {
    model: 'gemini-pro',
    apiKey: 'test-api-key',
    temperature: 0.7
  };

  const mockPromptConfig = {
    character: 'Analyze character development...',
    scene: 'Analyze scene structure...',
    theme: 'Identify themes...'
  };

  const mockCompleteAnalysis: CompleteAnalysis = {
    scenes: [
      { id: '1', title: 'Opening Scene', description: 'Test scene' }
    ],
    characters: [
      { name: 'John', description: 'Main character' }
    ],
    themes: ['friendship', 'adventure'],
    summary: 'Test screenplay analysis'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockProgressCallback = vi.fn();
    mockPartialResultCallback = vi.fn();
    
    // Mock AdminConfigService
    mockAdminConfigService = {
      getLLMConfig: vi.fn().mockResolvedValue(mockLLMConfig),
      getPromptConfig: vi.fn().mockResolvedValue(mockPromptConfig)
    } as any;
    
    (AdminConfigService as vi.MockedClass<typeof AdminConfigService>).mockImplementation(() => mockAdminConfigService);
    
    // Create console.log and console.error spies
    vi.spyOn(console, 'log').mockImplementation();
    vi.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize without callbacks', () => {
      geminiService = new GeminiAnalysisService();
      
      expect(geminiService).toBeInstanceOf(GeminiAnalysisService);
    });

    it('should initialize with progress callback only', () => {
      geminiService = new GeminiAnalysisService(mockProgressCallback);
      
      expect(geminiService).toBeInstanceOf(GeminiAnalysisService);
    });

    it('should initialize with both callbacks', () => {
      geminiService = new GeminiAnalysisService(mockProgressCallback, mockPartialResultCallback);
      
      expect(geminiService).toBeInstanceOf(GeminiAnalysisService);
    });

    it('should initialize with partial result callback only', () => {
      geminiService = new GeminiAnalysisService(undefined, mockPartialResultCallback);
      
      expect(geminiService).toBeInstanceOf(GeminiAnalysisService);
    });
  });

  describe('analyzeScreenplay', () => {
    beforeEach(() => {
      geminiService = new GeminiAnalysisService(mockProgressCallback, mockPartialResultCallback);
    });

    it('should successfully analyze screenplay and return complete analysis', async () => {
      const scriptText = 'FADE IN:\nINT. ROOM - DAY\nJohn walks in.';
      const filename = 'test-script.fountain';

      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay(scriptText, filename);

      // Simulate successful worker response
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'success',
              payload: mockCompleteAnalysis
            }
          }));
        }
      }, 10);

      const result = await analysisPromise;

      expect(result).toEqual(mockCompleteAnalysis);
      expect(mockAdminConfigService.getLLMConfig).toHaveBeenCalled();
      expect(mockAdminConfigService.getPromptConfig).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Creating new Gemini Analysis Worker...');
    });

    it('should handle worker error messages', async () => {
      const scriptText = 'Test script';
      const filename = 'test.fountain';
      const errorMessage = 'Analysis failed';

      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay(scriptText, filename);

      // Simulate error worker response
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'error',
              payload: errorMessage
            }
          }));
        }
      }, 10);

      await expect(analysisPromise).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('❌ Error message from Gemini Analysis Worker:', errorMessage);
    });

    it('should handle progress messages and call progress callback', async () => {
      const mockProgress: AnalysisProgress = {
        stage: 'character_analysis',
        progress: 50,
        message: 'Analyzing characters...'
      };

      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      // Simulate progress and success messages
      setTimeout(() => {
        if (mockWorker.onmessage) {
          // Send progress message
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'progress',
              payload: mockProgress
            }
          }));
          
          // Send success message
          setTimeout(() => {
            mockWorker.onmessage!(new MessageEvent('message', {
              data: {
                type: 'success',
                payload: mockCompleteAnalysis
              }
            }));
          }, 5);
        }
      }, 10);

      await analysisPromise;

      expect(mockProgressCallback).toHaveBeenCalledWith(mockProgress);
    });

    it('should handle partial result messages and call partial result callback', async () => {
      const mockPartialData = [{ id: '1', title: 'Scene 1' }];

      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          // Send partial result message
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'partial_result',
              payload: {
                section: 'scenes',
                data: mockPartialData
              }
            }
          }));
          
          // Send success message
          setTimeout(() => {
            mockWorker.onmessage!(new MessageEvent('message', {
              data: {
                type: 'success',
                payload: mockCompleteAnalysis
              }
            }));
          }, 5);
        }
      }, 10);

      await analysisPromise;

      expect(mockPartialResultCallback).toHaveBeenCalledWith('scenes', mockPartialData);
      expect(console.log).toHaveBeenCalledWith('📨 Partial result for section: scenes');
    });

    it('should handle worker onerror events', async () => {
      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      // Simulate worker error
      setTimeout(() => {
        if (mockWorker.onerror) {
          mockWorker.onerror(new ErrorEvent('error', {
            message: 'Worker crashed',
            filename: 'worker.js',
            lineno: 1
          }));
        }
      }, 10);

      await expect(analysisPromise).rejects.toThrow('Gemini Analysis Worker unhandled error: Worker crashed');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unhandled error in GeminiAnalysisService'));
    });

    it('should handle invalid worker message format', async () => {
      const mockWorker = new MockWorker('test-url');
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          // Send malformed message that will cause JSON parsing error
          mockWorker.onmessage(new MessageEvent('message', {
            data: null
          }));
        }
      }, 10);

      await expect(analysisPromise).rejects.toThrow('Failed to process worker message');
    });

    it('should handle configuration loading errors', async () => {
      mockAdminConfigService.getLLMConfig.mockRejectedValue(new Error('Config load failed'));

      await expect(geminiService.analyzeScreenplay('test', 'test.fountain'))
        .rejects.toThrow('Failed to load configuration');
      
      expect(console.error).toHaveBeenCalledWith('Failed to load configuration:', expect.any(Error));
    });

    it('should terminate previous worker before creating new one', async () => {
      const mockWorker1 = new MockWorker('test-url');
      const mockWorker2 = new MockWorker('test-url');
      const terminateSpy1 = vi.spyOn(mockWorker1, 'terminate');
      
      vi.spyOn(global, 'Worker')
        .mockImplementationOnce(() => mockWorker1)
        .mockImplementationOnce(() => mockWorker2);

      // Start first analysis
      const firstAnalysis = geminiService.analyzeScreenplay('test1', 'test1.fountain');
      
      // Start second analysis before first completes
      const secondAnalysis = geminiService.analyzeScreenplay('test2', 'test2.fountain');

      // Complete both analyses
      setTimeout(() => {
        if (mockWorker1.onmessage) {
          mockWorker1.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
        if (mockWorker2.onmessage) {
          mockWorker2.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
      }, 10);

      await Promise.all([firstAnalysis, secondAnalysis]);

      expect(terminateSpy1).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Terminating previous Gemini Analysis Worker...');
    });

    it('should handle empty script text', async () => {
      const result = await geminiService.analyzeScreenplay('', 'empty.fountain');
      
      // Should still attempt analysis even with empty text
      expect(mockAdminConfigService.getLLMConfig).toHaveBeenCalled();
    });

    it('should handle very large script text', async () => {
      const largeScript = 'FADE IN:\n'.repeat(10000);
      const mockWorker = new MockWorker('test-url');
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay(largeScript, 'large.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
      }, 10);

      await analysisPromise;

      expect(postMessageSpy).toHaveBeenCalledWith({
        scriptText: largeScript,
        filename: 'large.fountain',
        llmConfig: mockLLMConfig,
        promptConfig: mockPromptConfig
      });
    });

    it('should handle special characters in filename', async () => {
      const specialFilename = 'test-script_v2.0(final)!.fountain';
      const mockWorker = new MockWorker('test-url');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', specialFilename);

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
      }, 10);

      const result = await analysisPromise;
      expect(result).toEqual(mockCompleteAnalysis);
    });

    it('should work without callbacks provided', async () => {
      const serviceWithoutCallbacks = new GeminiAnalysisService();
      const mockWorker = new MockWorker('test-url');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = serviceWithoutCallbacks.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          // Send progress message (should not crash)
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'progress',
              payload: { stage: 'test', progress: 50, message: 'test' }
            }
          }));
          
          // Send partial result (should not crash)
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'partial_result',
              payload: { section: 'test', data: [] }
            }
          }));
          
          // Send success
          mockWorker.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
      }, 10);

      const result = await analysisPromise;
      expect(result).toEqual(mockCompleteAnalysis);
    });
  });

  describe('worker cleanup', () => {
    beforeEach(() => {
      geminiService = new GeminiAnalysisService();
    });

    it('should cleanup worker on successful completion', async () => {
      const mockWorker = new MockWorker('test-url');
      const terminateSpy = vi.spyOn(mockWorker, 'terminate');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: { type: 'success', payload: mockCompleteAnalysis }
          }));
        }
      }, 10);

      await analysisPromise;

      expect(terminateSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Cleaning up Gemini Analysis Worker...');
    });

    it('should cleanup worker on error', async () => {
      const mockWorker = new MockWorker('test-url');
      const terminateSpy = vi.spyOn(mockWorker, 'terminate');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: { type: 'error', payload: 'Test error' }
          }));
        }
      }, 10);

      await expect(analysisPromise).rejects.toThrow('Test error');

      expect(terminateSpy).toHaveBeenCalled();
    });

    it('should cleanup worker on unhandled error', async () => {
      const mockWorker = new MockWorker('test-url');
      const terminateSpy = vi.spyOn(mockWorker, 'terminate');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onerror) {
          mockWorker.onerror(new ErrorEvent('error', { message: 'Unhandled error' }));
        }
      }, 10);

      await expect(analysisPromise).rejects.toThrow('Gemini Analysis Worker unhandled error');

      expect(terminateSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases and error scenarios', () => {
    beforeEach(() => {
      geminiService = new GeminiAnalysisService(mockProgressCallback, mockPartialResultCallback);
    });

    it('should handle scenes data logging correctly', async () => {
      const mockScenesData = [{ id: '1', title: 'Scene 1' }, { id: '2', title: 'Scene 2' }];
      const mockWorker = new MockWorker('test-url');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'partial_result',
              payload: {
                section: 'scenes',
                data: mockScenesData
              }
            }
          }));
          
          setTimeout(() => {
            mockWorker.onmessage!(new MessageEvent('message', {
              data: { type: 'success', payload: mockCompleteAnalysis }
            }));
          }, 5);
        }
      }, 10);

      await analysisPromise;

      expect(console.log).toHaveBeenCalledWith('🎬 Received scenes data:', {
        dataType: 'object',
        isArray: true,
        length: 2,
        sample: mockScenesData[0]
      });
    });

    it('should handle non-array scenes data', async () => {
      const mockWorker = new MockWorker('test-url');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'partial_result',
              payload: {
                section: 'scenes',
                data: 'not an array'
              }
            }
          }));
          
          setTimeout(() => {
            mockWorker.onmessage!(new MessageEvent('message', {
              data: { type: 'success', payload: mockCompleteAnalysis }
            }));
          }, 5);
        }
      }, 10);

      await analysisPromise;

      expect(console.log).toHaveBeenCalledWith('🎬 Received scenes data:', {
        dataType: 'string',
        isArray: false,
        length: 'N/A',
        sample: 'Empty or not array'
      });
    });

    it('should handle unknown message types gracefully', async () => {
      const mockWorker = new MockWorker('test-url');
      
      vi.spyOn(global, 'Worker').mockImplementation(() => mockWorker);

      const analysisPromise = geminiService.analyzeScreenplay('test', 'test.fountain');

      setTimeout(() => {
        if (mockWorker.onmessage) {
          // Send unknown message type
          mockWorker.onmessage(new MessageEvent('message', {
            data: {
              type: 'unknown_type',
              payload: 'some data'
            }
          }));
          
          // Then send success
          setTimeout(() => {
            mockWorker.onmessage!(new MessageEvent('message', {
              data: { type: 'success', payload: mockCompleteAnalysis }
            }));
          }, 5);
        }
      }, 10);

      const result = await analysisPromise;
      expect(result).toEqual(mockCompleteAnalysis);
    });
  });
});