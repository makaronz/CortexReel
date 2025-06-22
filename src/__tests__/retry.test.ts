import { describe, it, expect } from 'vitest';
import { retryAsync } from '../services/llm/retry';

describe('retryAsync', () => {
  it('retries failing function', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 2) return Promise.reject(new Error('fail'));
      return Promise.resolve('ok');
    };
    const result = await retryAsync(fn, 3, 10);
    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });
});
