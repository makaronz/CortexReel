import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryAsync, type ShouldRetryFn } from '../services/llm/retry';

describe('retryAsync', () => {
  let consoleSpy: any;
  
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic Retry Functionality', () => {
    it('retries failing function until success', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 3) return Promise.reject(new Error('Temporary failure'));
        return Promise.resolve('success');
      };
      
      const result = await retryAsync(fn, 5, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('returns result immediately on first success', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.resolve('immediate success');
      };
      
      const result = await retryAsync(fn, 3, 10);
      expect(result).toBe('immediate success');
      expect(attempts).toBe(1);
    });

    it('throws last error when all attempts fail', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error(`Attempt ${attempts} failed`));
      };
      
      await expect(retryAsync(fn, 3, 10)).rejects.toThrow('Attempt 3 failed');
      expect(attempts).toBe(3);
    });

    it('respects maximum retry attempts', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Always fails'));
      };
      
      await expect(retryAsync(fn, 2, 5)).rejects.toThrow('Always fails');
      expect(attempts).toBe(2);
    });
  });

  describe('Delay and Timing', () => {
    it('applies exponential backoff delay', async () => {
      let attempts = 0;
      const timestamps: number[] = [];
      
      const fn = () => {
        attempts++;
        timestamps.push(Date.now());
        if (attempts < 3) return Promise.reject(new Error('Retry test'));
        return Promise.resolve('success');
      };
      
      const startTime = Date.now();
      await retryAsync(fn, 3, 100);
      const endTime = Date.now();
      
      expect(attempts).toBe(3);
      expect(endTime - startTime).toBeGreaterThan(300); // At least 100ms + 200ms delays
      expect(timestamps).toHaveLength(3);
    });

    it('handles zero delay', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) return Promise.reject(new Error('Quick retry'));
        return Promise.resolve('fast success');
      };
      
      const startTime = Date.now();
      const result = await retryAsync(fn, 3, 0);
      const endTime = Date.now();
      
      expect(result).toBe('fast success');
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });

    it('does not delay after final attempt', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Final attempt'));
      };
      
      const startTime = Date.now();
      try {
        await retryAsync(fn, 2, 1000); // Long delay to test it's not applied after final attempt
      } catch (error) {
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(1500); // Should not include final delay
      }
    });
  });

  describe('Smart Retry with shouldRetry Function', () => {
    it('stops retrying when shouldRetry returns false', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Non-retryable error'));
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        return attemptNumber <= 1; // Only retry first failure
      };
      
      await expect(retryAsync(fn, 5, 10, shouldRetry)).rejects.toThrow('Non-retryable error');
      expect(attempts).toBe(2); // Initial attempt + 1 retry
    });

    it('continues retrying when shouldRetry returns true', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 4) return Promise.reject(new Error('Retryable error'));
        return Promise.resolve('eventual success');
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        return error instanceof Error && error.message.includes('Retryable');
      };
      
      const result = await retryAsync(fn, 5, 5, shouldRetry);
      expect(result).toBe('eventual success');
      expect(attempts).toBe(4);
    });

    it('provides correct attempt number to shouldRetry', async () => {
      const attemptNumbers: number[] = [];
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Test error'));
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        attemptNumbers.push(attemptNumber);
        return attemptNumber <= 2;
      };
      
      await expect(retryAsync(fn, 5, 5, shouldRetry)).rejects.toThrow('Test error');
      expect(attemptNumbers).toEqual([1, 2, 3]); // Called after each failure
      expect(attempts).toBe(3);
    });

    it('handles shouldRetry function that throws', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Original error'));
      };
      
      const shouldRetry: ShouldRetryFn = () => {
        throw new Error('shouldRetry error');
      };
      
      // Should treat shouldRetry error as "don't retry"
      await expect(retryAsync(fn, 3, 5, shouldRetry)).rejects.toThrow('Original error');
      expect(attempts).toBe(1); // No retries due to shouldRetry error
    });
  });

  describe('Error Type Handling', () => {
    it('handles different error types correctly', async () => {
      const errorTypes = [
        new Error('Standard Error'),
        new TypeError('Type Error'),
        'String error',
        { message: 'Object error' },
        null,
        undefined
      ];
      
      for (const errorType of errorTypes) {
        let attempts = 0;
        const fn = () => {
          attempts++;
          return Promise.reject(errorType);
        };
        
        await expect(retryAsync(fn, 2, 1)).rejects.toBe(errorType);
        expect(attempts).toBe(2);
      }
    });

    it('preserves original error stack trace', async () => {
      const originalError = new Error('Original error with stack');
      const originalStack = originalError.stack;
      
      const fn = () => Promise.reject(originalError);
      
      try {
        await retryAsync(fn, 2, 1);
      } catch (caughtError) {
        expect(caughtError).toBe(originalError);
        expect((caughtError as Error).stack).toBe(originalStack);
      }
    });
  });

  describe('Network Simulation Scenarios', () => {
    it('handles network timeout errors with smart retry', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts <= 2) {
          return Promise.reject(new Error('Network timeout occurred'));
        }
        return Promise.resolve('network recovered');
      };
      
      const shouldRetry: ShouldRetryFn = (error) => {
        return error instanceof Error && error.message.includes('timeout');
      };
      
      const result = await retryAsync(fn, 5, 10, shouldRetry);
      expect(result).toBe('network recovered');
      expect(attempts).toBe(3);
    });

    it('does not retry permanent failures', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('404 Not Found'));
      };
      
      const shouldRetry: ShouldRetryFn = (error) => {
        return !(error instanceof Error && error.message.includes('404'));
      };
      
      await expect(retryAsync(fn, 5, 10, shouldRetry)).rejects.toThrow('404 Not Found');
      expect(attempts).toBe(1); // No retries for 404
    });

    it('handles rate limiting with progressive backoff', async () => {
      let attempts = 0;
      const timestamps: number[] = [];
      
      const fn = () => {
        attempts++;
        timestamps.push(Date.now());
        if (attempts <= 2) {
          return Promise.reject(new Error('Rate limit exceeded'));
        }
        return Promise.resolve('rate limit cleared');
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        return error instanceof Error && 
               error.message.includes('Rate limit') && 
               attemptNumber <= 3;
      };
      
      const result = await retryAsync(fn, 4, 50, shouldRetry);
      expect(result).toBe('rate limit cleared');
      expect(attempts).toBe(3);
      
      // Verify progressive delays
      if (timestamps.length >= 3) {
        const delay1 = timestamps[1] - timestamps[0];
        const delay2 = timestamps[2] - timestamps[1];
        expect(delay2).toBeGreaterThan(delay1); // Progressive backoff
      }
    });
  });

  describe('Malformed Response Scenarios', () => {
    it('handles JSON parsing errors with retry', async () => {
      let attempts = 0;
      const responses = [
        'invalid json{',
        '{"incomplete": ',
        '{"valid": "json"}'
      ];
      
      const fn = () => {
        attempts++;
        const response = responses[attempts - 1];
        if (attempts <= 2) {
          return Promise.reject(new Error(`JSON parse error: ${response}`));
        }
        return Promise.resolve(JSON.parse(response));
      };
      
      const shouldRetry: ShouldRetryFn = (error) => {
        return error instanceof Error && error.message.includes('JSON parse');
      };
      
      const result = await retryAsync(fn, 3, 10, shouldRetry);
      expect(result).toEqual({ valid: 'json' });
      expect(attempts).toBe(3);
    });

    it('handles quota exceeded errors without retry', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Quota exceeded for this month'));
      };
      
      const shouldRetry: ShouldRetryFn = (error) => {
        return !(error instanceof Error && error.message.includes('Quota exceeded'));
      };
      
      await expect(retryAsync(fn, 5, 10, shouldRetry)).rejects.toThrow('Quota exceeded');
      expect(attempts).toBe(1); // No retries for quota errors
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('handles zero attempts', async () => {
      const fn = vi.fn().mockResolvedValue('should not be called');
      
      await expect(retryAsync(fn, 0, 10)).rejects.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    it('handles negative attempts', async () => {
      const fn = vi.fn().mockResolvedValue('should not be called');
      
      await expect(retryAsync(fn, -1, 10)).rejects.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    it('handles function that returns undefined', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) return Promise.reject(new Error('Retry once'));
        return Promise.resolve(undefined);
      };
      
      const result = await retryAsync(fn, 3, 5);
      expect(result).toBeUndefined();
      expect(attempts).toBe(2);
    });

    it('handles function that returns null', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) return Promise.reject(new Error('Retry once'));
        return Promise.resolve(null);
      };
      
      const result = await retryAsync(fn, 3, 5);
      expect(result).toBeNull();
      expect(attempts).toBe(2);
    });

    it('handles very large delay values', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) return Promise.reject(new Error('Quick fail'));
        return Promise.resolve('success');
      };
      
      // Use large delay but should still complete quickly due to success
      const result = await retryAsync(fn, 3, 10000);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });
  });

  describe('Complex Scenarios', () => {
    it('handles mixed error types with sophisticated retry logic', async () => {
      let attempts = 0;
      const errorSequence = [
        new Error('Network timeout'),
        new Error('Rate limit exceeded'),
        new Error('JSON parse error'),
        'success'
      ];
      
      const fn = () => {
        attempts++;
        const response = errorSequence[attempts - 1];
        if (typeof response === 'string') {
          return Promise.resolve(response);
        }
        return Promise.reject(response);
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        if (!(error instanceof Error)) return false;
        
        // Retry network issues up to 3 attempts
        if (error.message.includes('timeout')) return attemptNumber <= 3;
        
        // Retry rate limits up to 2 attempts
        if (error.message.includes('Rate limit')) return attemptNumber <= 2;
        
        // Don't retry parse errors
        if (error.message.includes('parse')) return false;
        
        return false;
      };
      
      const result = await retryAsync(fn, 5, 5, shouldRetry);
      expect(result).toBe('success');
      expect(attempts).toBe(4);
    });

    it('integrates with realistic API failure patterns', async () => {
      let attempts = 0;
      const apiResponses = [
        { status: 429, error: 'Too Many Requests' },
        { status: 500, error: 'Internal Server Error' },
        { status: 503, error: 'Service Unavailable' },
        { status: 200, data: 'API Success' }
      ];
      
      const fn = async () => {
        attempts++;
        const response = apiResponses[attempts - 1];
        
        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.error}`);
        }
        
        return response.data;
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        if (!(error instanceof Error)) return false;
        
        // Retry server errors and rate limits, but not client errors
        const retryableStatuses = ['429', '500', '502', '503', '504'];
        const hasRetryableStatus = retryableStatuses.some(status => 
          error.message.includes(status)
        );
        
        return hasRetryableStatus && attemptNumber <= 3;
      };
      
      const result = await retryAsync(fn, 4, 20, shouldRetry);
      expect(result).toBe('API Success');
      expect(attempts).toBe(4);
    });
  });
});
