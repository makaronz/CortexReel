export type ShouldRetryFn = (error: unknown, attempt: number) => boolean;

export async function retryAsync<T>(
  fn: () => Promise<T>, 
  attempts = 3, 
  delayMs = 500,
  shouldRetry?: ShouldRetryFn
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // If we have a shouldRetry function and it returns false, don't retry
      if (shouldRetry && !shouldRetry(err, i + 1)) {
        throw err;
      }
      
      // Don't delay after the last attempt
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
