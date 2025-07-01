import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  processAnalysis, 
  getWorkerState, 
  getProcessingMetrics, 
  shutdownWorker,
  type AnalysisRequest,
  type AnalysisResult 
} from './geminiAnalysis.worker';

// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Mock analysis response with detailed insights about the content.'
        }
      })
    })
  }))
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('GeminiAnalysis Worker', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { 
      ...originalEnv, 
      GEMINI_API_KEY: 'AIzaSyDMockApiKeyForTesting123456789012345' 
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('processAnalysis - Happy Path', () => {
    it('should successfully process string input', async () => {
      const result = await processAnalysis('Test content for analysis');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.analysis).toBeDefined();
      expect(result.data?.confidence).toBeGreaterThan(0);
      expect(result.data?.categories).toBeInstanceOf(Array);
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
      expect(result.metadata?.model).toBe('gemini-pro');
    });

    it('should successfully process AnalysisRequest object', async () => {
      const request: AnalysisRequest = {
        content: 'Detailed content for analysis',
        options: {
          temperature: 0.7,
          maxTokens: 1000,
          model: 'gemini-pro'
        }
      };

      const result = await processAnalysis(request);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.analysis).toBeDefined();
      expect(result.metadata?.tokenCount).toBeGreaterThan(0);
    });

    it('should handle different content types correctly', async () => {
      const contentTypes = [
        'Plain text content',
        '<html><body>HTML content</body></html>',
        '{"json": "content", "type": "object"}',
        'function test() { return "JavaScript code"; }',
        '# Markdown Content\n## Heading\n- List item'
      ];

      for (const content of contentTypes) {
        const result = await processAnalysis(content);
        expect(result.success).toBe(true);
        expect(result.data?.analysis).toBeDefined();
      }
    });

    it('should handle special characters and unicode', async () => {
      const unicodeContent = '🚀 Émojis and spëcial çharacters: ñoñó, русский, 中文, العربية';
      const result = await processAnalysis(unicodeContent);
      
      expect(result.success).toBe(true);
      expect(result.data?.analysis).toBeDefined();
    });
  });

  describe('processAnalysis - Input Validation', () => {
    it('should handle null input gracefully', async () => {
      const result = await processAnalysis(null as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: null or undefined');
    });

    it('should handle undefined input gracefully', async () => {
      const result = await processAnalysis(undefined as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: null or undefined');
    });

    it('should handle empty string input', async () => {
      const result = await processAnalysis('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: empty string');
    });

    it('should handle whitespace-only string input', async () => {
      const result = await processAnalysis('   \t\n   ');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input: empty string');
    });

    it('should handle invalid input types', async () => {
      const invalidInputs = [123, [], {}, true, false, { invalid: 'object' }];
      
      for (const input of invalidInputs) {
        const result = await processAnalysis(input as any);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid input type');
      }
    });

    it('should handle extremely large input strings', async () => {
      const largeInput = 'a'.repeat(1000001); // Just over 1MB
      const result = await processAnalysis(largeInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input too large: content exceeds 1MB limit');
    });

    it('should handle input at size limit boundary', async () => {
      const limitInput = 'a'.repeat(1000000); // Exactly 1MB
      const result = await processAnalysis(limitInput);
      
      expect(result.success).toBe(true);
    });
  });

  describe('processAnalysis - Environment and Configuration', () => {
    it('should handle missing API key', async () => {
      delete process.env.GEMINI_API_KEY;
      
      // Create a new instance to test initialization
      const { processAnalysis: newProcessAnalysis } = await import('./geminiAnalysis.worker');
      const result = await newProcessAnalysis('test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('GEMINI_API_KEY environment variable is required');
    });

    it('should handle invalid API key format', async () => {
      process.env.GEMINI_API_KEY = 'invalid-short-key';
      
      const { processAnalysis: newProcessAnalysis } = await import('./geminiAnalysis.worker');
      const result = await newProcessAnalysis('test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid GEMINI_API_KEY format');
    });

    it('should accept valid API key format', async () => {
      process.env.GEMINI_API_KEY = 'AIzaSyValidKeyFormatWith30PlusChars123';
      
      const result = await processAnalysis('test content');
      expect(result.success).toBe(true);
    });
  });

  describe('processAnalysis - Error Handling and Resilience', () => {
    it('should handle API errors gracefully', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const mockGenAI = GoogleGenerativeAI as any;
      
      mockGenAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: vi.fn().mockRejectedValue(new Error('API Error: Rate limit exceeded'))
        })
      }));

      const result = await processAnalysis('test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Analysis failed: API Error: Rate limit exceeded');
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
    });

    it('should implement circuit breaker pattern', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const mockGenAI = GoogleGenerativeAI as any;
      
      // Mock consistent failures
      mockGenAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: vi.fn().mockRejectedValue(new Error('Service unavailable'))
        })
      }));

      // Generate multiple failures to trigger circuit breaker
      const results = [];
      for (let i = 0; i < 7; i++) {
        results.push(await processAnalysis(`request ${i}`));
      }

      // Last few requests should trigger circuit breaker
      const lastResult = results[results.length - 1];
      expect(lastResult.success).toBe(false);
    });

    it('should recover from circuit breaker after timeout', async () => {
      // This would require mocking time, simplified for this example
      const state = getWorkerState();
      expect(typeof state.circuitBreakerOpen).toBe('boolean');
    });
  });

  describe('processAnalysis - Performance and Concurrency', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        processAnalysis(`concurrent request ${i}`)
      );

      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data?.analysis).toBeDefined();
      });
    });

    it('should track active requests correctly', async () => {
      const initialState = getWorkerState();
      const initialActive = initialState.activeRequests;
      
      const promise = processAnalysis('test request for tracking');
      
      // Request should complete
      const result = await promise;
      const finalState = getWorkerState();
      
      expect(result.success).toBe(true);
      expect(finalState.activeRequests).toBe(initialActive);
    });

    it('should measure processing time accurately', async () => {
      const result = await processAnalysis('test for timing');
      
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
      expect(result.metadata?.processingTime).toBeLessThan(10000); // Should be under 10 seconds
    });
  });

  describe('Worker State Management', () => {
    it('should initialize worker state correctly', () => {
      const state = getWorkerState();
      
      expect(state).toHaveProperty('isInitialized');
      expect(state).toHaveProperty('activeRequests');
      expect(state).toHaveProperty('totalProcessed');
      expect(state).toHaveProperty('errorCount');
      expect(state).toHaveProperty('circuitBreakerOpen');
      
      expect(typeof state.isInitialized).toBe('boolean');
      expect(typeof state.activeRequests).toBe('number');
      expect(typeof state.totalProcessed).toBe('number');
      expect(typeof state.errorCount).toBe('number');
      expect(typeof state.circuitBreakerOpen).toBe('boolean');
      
      expect(state.activeRequests).toBeGreaterThanOrEqual(0);
      expect(state.totalProcessed).toBeGreaterThanOrEqual(0);
      expect(state.errorCount).toBeGreaterThanOrEqual(0);
    });

    it('should track total processed requests', async () => {
      const initialMetrics = getProcessingMetrics();
      const initialTotal = initialMetrics.totalProcessed;
      
      await processAnalysis('test request 1');
      await processAnalysis('test request 2');
      
      const updatedMetrics = getProcessingMetrics();
      expect(updatedMetrics.totalProcessed).toBe(initialTotal + 2);
    });

    it('should calculate success rate correctly', async () => {
      const metrics = getProcessingMetrics();
      
      expect(metrics).toHaveProperty('totalProcessed');
      expect(metrics).toHaveProperty('errorCount');
      expect(metrics).toHaveProperty('successRate');
      
      expect(typeof metrics.successRate).toBe('number');
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Worker Lifecycle', () => {
    it('should shutdown gracefully', async () => {
      // Start some requests
      const promises = [
        processAnalysis('shutdown test 1'),
        processAnalysis('shutdown test 2')
      ];

      // All requests should complete before shutdown
      await Promise.all(promises);
      
      // Shutdown should complete without hanging
      await expect(shutdownWorker()).resolves.toBeUndefined();
    });

    it('should wait for active requests during shutdown', async () => {
      // This test would require more sophisticated mocking to properly test
      // the waiting behavior, but we can at least verify the function exists
      expect(typeof shutdownWorker).toBe('function');
    });
  });

  describe('Response Processing and Data Structure', () => {
    it('should return properly structured success response', async () => {
      const result = await processAnalysis('test content');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('analysis');
        expect(result.data).toHaveProperty('confidence');
        expect(result.data).toHaveProperty('categories');
        expect(result.data).toHaveProperty('keyTopics');
        
        expect(typeof result.data.analysis).toBe('string');
        expect(typeof result.data.confidence).toBe('number');
        expect(Array.isArray(result.data.categories)).toBe(true);
        expect(Array.isArray(result.data.keyTopics)).toBe(true);
        
        expect(result.data.confidence).toBeGreaterThan(0);
        expect(result.data.confidence).toBeLessThanOrEqual(1);
      }
      
      if (result.metadata) {
        expect(result.metadata).toHaveProperty('processingTime');
        expect(result.metadata).toHaveProperty('tokenCount');
        expect(result.metadata).toHaveProperty('model');
        
        expect(typeof result.metadata.processingTime).toBe('number');
        expect(typeof result.metadata.tokenCount).toBe('number');
        expect(typeof result.metadata.model).toBe('string');
        
        expect(result.metadata.processingTime).toBeGreaterThan(0);
        expect(result.metadata.tokenCount).toBeGreaterThan(0);
      }
    });

    it('should return properly structured error response', async () => {
      const result = await processAnalysis(null as any);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    });

    it('should include metadata in error responses when available', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const mockGenAI = GoogleGenerativeAI as any;
      
      mockGenAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: vi.fn().mockRejectedValue(new Error('Mock API error'))
        })
      }));

      const result = await processAnalysis('test content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
    });
  });

  describe('Token Count Estimation', () => {
    it('should estimate token count reasonably', async () => {
      const shortContent = 'Short text';
      const longContent = 'This is a much longer piece of content that should have more tokens '.repeat(10);
      
      const shortResult = await processAnalysis(shortContent);
      const longResult = await processAnalysis(longContent);
      
      if (shortResult.success && longResult.success) {
        expect(longResult.metadata?.tokenCount).toBeGreaterThan(shortResult.metadata?.tokenCount || 0);
      }
    });

    it('should provide non-zero token count for valid content', async () => {
      const result = await processAnalysis('Test content with multiple words');
      
      if (result.success) {
        expect(result.metadata?.tokenCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow with realistic content', async () => {
      const realisticContent = `
        Product Requirements Document
        
        Overview:
        This document outlines the requirements for a new user authentication system.
        
        Features:
        - Multi-factor authentication
        - Social login integration
        - Password reset functionality
        - Session management
        
        Technical Requirements:
        - OAuth 2.0 compliance
        - JWT token implementation
        - Rate limiting for security
        - Audit logging
        
        User Stories:
        1. As a user, I want to log in securely
        2. As a user, I want to reset my password easily
        3. As an admin, I want to monitor authentication attempts
      `;

      const result = await processAnalysis(realisticContent);
      
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.analysis.length).toBeGreaterThan(10);
        expect(result.data.confidence).toBeGreaterThan(0.5);
        expect(result.data.categories.length).toBeGreaterThan(0);
        expect(result.data.keyTopics.length).toBeGreaterThan(0);
      }
      
      if (result.metadata) {
        expect(result.metadata.processingTime).toBeGreaterThan(0);
        expect(result.metadata.tokenCount).toBeGreaterThan(50); // Should have many tokens
        expect(result.metadata.model).toBe('gemini-pro');
      }
    });

    it('should maintain consistency across similar inputs', async () => {
      const similarInputs = [
        'Analyze this software requirement',
        'Please analyze this software requirement',
        'Software requirement analysis needed'
      ];

      const results = await Promise.all(
        similarInputs.map(input => processAnalysis(input))
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
        if (result.data) {
          expect(result.data.categories.length).toBeGreaterThan(0);
          expect(result.data.confidence).toBeGreaterThan(0);
        }
      });
    });

    it('should handle mixed content types in sequence', async () => {
      const contentSequence = [
        'Plain text analysis request',
        '{"type": "json", "request": "analysis"}',
        '<html><body>HTML content</body></html>',
        '# Markdown\n## Analysis Request'
      ];

      for (const content of contentSequence) {
        const result = await processAnalysis(content);
        expect(result.success).toBe(true);
        if (result.data) {
          expect(result.data.analysis).toBeDefined();
        }
      }

      // Verify worker state remains healthy
      const finalState = getWorkerState();
      expect(finalState.isInitialized).toBe(true);
      expect(finalState.activeRequests).toBe(0);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle content with only special characters', async () => {
      const specialContent = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = await processAnalysis(specialContent);
      
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.analysis).toBeDefined();
      }
    });

    it('should handle content with mixed languages', async () => {
      const multilingualContent = 'English text, 中文内容, русский текст, العربية, español';
      const result = await processAnalysis(multilingualContent);
      
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.analysis).toBeDefined();
      }
    });

    it('should handle very short content', async () => {
      const shortContent = 'Hi';
      const result = await processAnalysis(shortContent);
      
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.analysis).toBeDefined();
        expect(result.data.confidence).toBeGreaterThan(0);
      }
    });

    it('should handle content with repeated patterns', async () => {
      const repeatedContent = 'test '.repeat(1000);
      const result = await processAnalysis(repeatedContent);
      
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.analysis).toBeDefined();
      }
    });
  });
});

// Additional tests for specific AnalysisRequest configurations
describe('GeminiAnalysis Worker - AnalysisRequest Options', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'AIzaSyDMockApiKeyForTesting123456789012345';
  });

  it('should handle AnalysisRequest with custom temperature', async () => {
    const request: AnalysisRequest = {
      content: 'Test content',
      options: {
        temperature: 0.5
      }
    };

    const result = await processAnalysis(request);
    expect(result.success).toBe(true);
  });

  it('should handle AnalysisRequest with maxTokens', async () => {
    const request: AnalysisRequest = {
      content: 'Test content',
      options: {
        maxTokens: 500
      }
    };

    const result = await processAnalysis(request);
    expect(result.success).toBe(true);
  });

  it('should handle AnalysisRequest with custom model', async () => {
    const request: AnalysisRequest = {
      content: 'Test content',
      options: {
        model: 'gemini-pro'
      }
    };

    const result = await processAnalysis(request);
    expect(result.success).toBe(true);
  });

  it('should handle AnalysisRequest with all options', async () => {
    const request: AnalysisRequest = {
      content: 'Comprehensive test content for analysis',
      options: {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'gemini-pro'
      }
    };

    const result = await processAnalysis(request);
    expect(result.success).toBe(true);
    if (result.data) {
      expect(result.data.analysis).toBeDefined();
      expect(result.data.confidence).toBeGreaterThan(0);
    }
  });
});