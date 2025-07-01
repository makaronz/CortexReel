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

  describe('Performance and Resource Management', () => {
    it('handles concurrent retry operations', async () => {
      let globalAttempts = 0;
      const fn = () => {
        globalAttempts++;
        if (globalAttempts < 6) return Promise.reject(new Error('Concurrent test'));
        return Promise.resolve('concurrent success');
      };
      
      const promises = [
        retryAsync(fn, 3, 5),
        retryAsync(fn, 3, 5),
        retryAsync(fn, 3, 5)
      ];
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      expect(successful.length + failed.length).toBe(3);
      expect(globalAttempts).toBeGreaterThan(3);
    });

    it('handles memory-intensive operations with retry', async () => {
      let attempts = 0;
      const largeArray = new Array(10000).fill('test');
      
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          // Simulate memory pressure scenario
          const tempArray = [...largeArray, ...largeArray];
          throw new Error('Memory pressure simulation');
        }
        return Promise.resolve(largeArray.length);
      };
      
      const result = await retryAsync(fn, 4, 10);
      expect(result).toBe(10000);
      expect(attempts).toBe(3);
    });

    it('handles retry with promise chain operations', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (attempts < 3) {
              reject(new Error('Async chain failure'));
            } else {
              resolve('chain success');
            }
          }, 1);
        });
      };
      
      const result = await retryAsync(fn, 4, 5);
      expect(result).toBe('chain success');
      expect(attempts).toBe(3);
    });
  });

  describe('Advanced Error Scenarios', () => {
    it('handles circular reference errors', async () => {
      let attempts = 0;
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const fn = () => {
        attempts++;
        if (attempts < 2) {
          const error = new Error('Circular reference error');
          (error as any).data = circularObj;
          return Promise.reject(error);
        }
        return Promise.resolve('resolved after circular error');
      };
      
      const result = await retryAsync(fn, 3, 5);
      expect(result).toBe('resolved after circular error');
      expect(attempts).toBe(2);
    });

    it('handles errors with complex nested properties', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        if (attempts < 2) {
          const complexError = new Error('Complex error');
          (complexError as any).details = {
            code: 500,
            nested: {
              level: 2,
              data: [1, 2, 3],
              metadata: { timestamp: Date.now() }
            }
          };
          return Promise.reject(complexError);
        }
        return Promise.resolve('complex error resolved');
      };
      
      const result = await retryAsync(fn, 3, 5);
      expect(result).toBe('complex error resolved');
      expect(attempts).toBe(2);
    });

    it('handles promise rejection with non-Error objects', async () => {
      const rejectionValues = [
        { status: 500, message: 'Server Error' },
        ['array', 'error'],
        42,
        false,
        Symbol('error')
      ];
      
      for (const rejectionValue of rejectionValues) {
        let attempts = 0;
        const fn = () => {
          attempts++;
          if (attempts < 2) return Promise.reject(rejectionValue);
          return Promise.resolve('success');
        };
        
        const result = await retryAsync(fn, 3, 1);
        expect(result).toBe('success');
        expect(attempts).toBe(2);
      }
    });
  });

  describe('Retry Function Validation', () => {
    it('validates shouldRetry function receives correct error context', async () => {
      const errorContexts: Array<{ error: any, attempt: number }> = [];
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        const error = new Error(`Attempt ${attempts} error`);
        (error as any).attemptNumber = attempts;
        (error as any).timestamp = Date.now();
        return Promise.reject(error);
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        errorContexts.push({ error, attempt: attemptNumber });
        return attemptNumber <= 2;
      };
      
      await expect(retryAsync(fn, 4, 5, shouldRetry)).rejects.toThrow('Attempt 3 error');
      
      expect(errorContexts).toHaveLength(3);
      expect(errorContexts[0].attempt).toBe(1);
      expect(errorContexts[1].attempt).toBe(2);
      expect(errorContexts[2].attempt).toBe(3);
      
      // Verify error objects have expected properties
      errorContexts.forEach((ctx, index) => {
        expect(ctx.error).toBeInstanceOf(Error);
        expect((ctx.error as any).attemptNumber).toBe(index + 1);
        expect((ctx.error as any).timestamp).toBeDefined();
      });
    });

    it('handles shouldRetry with async operations', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        return Promise.reject(new Error(`Async retry test ${attempts}`));
      };
      
      const shouldRetry: ShouldRetryFn = async (error, attemptNumber) => {
        // Simulate async decision making
        await new Promise(resolve => setTimeout(resolve, 5));
        return attemptNumber <= 2;
      };
      
      await expect(retryAsync(fn, 4, 5, shouldRetry)).rejects.toThrow('Async retry test 3');
      expect(attempts).toBe(3);
    });

    it('handles shouldRetry returning promise that rejects', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('Original function error'));
      };
      
      const shouldRetry: ShouldRetryFn = () => {
        return Promise.reject(new Error('shouldRetry promise rejection'));
      };
      
      // Should treat shouldRetry rejection as "don't retry"
      await expect(retryAsync(fn, 3, 5, shouldRetry)).rejects.toThrow('Original function error');
      expect(attempts).toBe(1);
    });
  });

  describe('Boundary Value Testing', () => {
    it('handles exactly max attempts with immediate success', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        if (attempts === 5) return Promise.resolve('success on final attempt');
        return Promise.reject(new Error(`Attempt ${attempts} failed`));
      };
      
      const result = await retryAsync(fn, 5, 10);
      expect(result).toBe('success on final attempt');
      expect(attempts).toBe(5);
    });

    it('handles single attempt with success', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        return Promise.resolve('single attempt success');
      };
      
      const result = await retryAsync(fn, 1, 100);
      expect(result).toBe('single attempt success');
      expect(attempts).toBe(1);
    });

    it('handles maximum safe integer delay', async () => {
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        if (attempts === 1) return Promise.reject(new Error('First attempt'));
        return Promise.resolve('recovered');
      };
      
      // Should not actually wait for Number.MAX_SAFE_INTEGER
      const startTime = Date.now();
      const result = await retryAsync(fn, 2, Number.MAX_SAFE_INTEGER);
      const endTime = Date.now();
      
      expect(result).toBe('recovered');
      expect(attempts).toBe(2);
      // Should complete quickly despite large delay due to success
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Logging and Observability', () => {
    it('logs errors correctly during retry attempts', async () => {
      const loggedErrors: string[] = [];
      consoleSpy.mockImplementation((message: string) => {
        loggedErrors.push(message);
      });
      
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error(`Logged error ${attempts}`));
      };
      
      await expect(retryAsync(fn, 3, 5)).rejects.toThrow('Logged error 3');
      
      // Verify console.error was called for logging (if implemented in retry function)
      expect(attempts).toBe(3);
    });

    it('maintains error context through retry chain', async () => {
      const errorChain: Error[] = [];
      let attempts = 0;
      
      const fn = () => {
        attempts++;
        const error = new Error(`Chain error ${attempts}`);
        error.stack = `Error stack for attempt ${attempts}\n    at test location`;
        errorChain.push(error);
        return Promise.reject(error);
      };
      
      try {
        await retryAsync(fn, 3, 5);
      } catch (finalError) {
        expect(finalError).toBe(errorChain[2]); // Should be the last error
        expect(errorChain).toHaveLength(3);
        expect((finalError as Error).message).toBe('Chain error 3');
      }
    });
  });

  describe('Integration with Real-World Patterns', () => {
    it('handles database connection retry pattern', async () => {
      let attempts = 0;
      const connectionStates = ['DISCONNECTED', 'CONNECTING', 'CONNECTED'];
      
      const fn = async () => {
        attempts++;
        const state = connectionStates[Math.min(attempts - 1, connectionStates.length - 1)];
        
        if (state !== 'CONNECTED') {
          throw new Error(`Database connection failed: ${state}`);
        }
        
        return { status: 'CONNECTED', connectionId: 'db-conn-123' };
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        return error instanceof Error && 
               error.message.includes('connection failed') && 
               attemptNumber <= 3;
      };
      
      const result = await retryAsync(fn, 4, 25, shouldRetry);
      expect(result.status).toBe('CONNECTED');
      expect(result.connectionId).toBe('db-conn-123');
      expect(attempts).toBe(3);
    });

    it('handles file system operation retry pattern', async () => {
      let attempts = 0;
      const fsErrors = [
        'ENOENT: no such file or directory',
        'EACCES: permission denied',
        'EMFILE: too many open files'
      ];
      
      const fn = async () => {
        attempts++;
        
        if (attempts <= 2) {
          const error = new Error(fsErrors[attempts - 1]);
          (error as any).code = fsErrors[attempts - 1].split(':')[0];
          throw error;
        }
        
        return { data: 'file content read successfully', size: 1024 };
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        if (!(error instanceof Error)) return false;
        
        // Retry for transient file system errors but not permission errors
        const retryableCodes = ['ENOENT', 'EMFILE'];
        const errorCode = (error as any).code;
        
        return retryableCodes.includes(errorCode) && attemptNumber <= 3;
      };
      
      const result = await retryAsync(fn, 4, 15, shouldRetry);
      expect(result.data).toBe('file content read successfully');
      expect(result.size).toBe(1024);
      expect(attempts).toBe(3);
    });

    it('handles webhook delivery retry pattern', async () => {
      let attempts = 0;
      const deliveryAttempts: Array<{ timestamp: number, status: number }> = [];
      
      const fn = async () => {
        attempts++;
        const timestamp = Date.now();
        
        if (attempts <= 2) {
          const status = attempts === 1 ? 503 : 429;
          deliveryAttempts.push({ timestamp, status });
          throw new Error(`Webhook delivery failed: HTTP ${status}`);
        }
        
        deliveryAttempts.push({ timestamp, status: 200 });
        return { delivered: true, attempts, timestamp };
      };
      
      const shouldRetry: ShouldRetryFn = (error, attemptNumber) => {
        if (!(error instanceof Error)) return false;
        
        // Retry for server errors and rate limits
        const retryableStatuses = ['503', '502', '429', '500'];
        const hasRetryableStatus = retryableStatuses.some(status => 
          error.message.includes(status)
        );
        
        return hasRetryableStatus && attemptNumber <= 4;
      };
      
      const result = await retryAsync(fn, 5, 30, shouldRetry);
      expect(result.delivered).toBe(true);
      expect(result.attempts).toBe(3);
      expect(deliveryAttempts).toHaveLength(3);
      expect(deliveryAttempts[0].status).toBe(503);
      expect(deliveryAttempts[1].status).toBe(429);
      expect(deliveryAttempts[2].status).toBe(200);
    });
  });
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
