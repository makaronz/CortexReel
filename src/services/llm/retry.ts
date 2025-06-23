/**
 * Attempts to execute an asynchronous function multiple times with increasing delays between retries.
 *
 * If the provided function fails, it is retried up to the specified number of attempts. The delay between retries increases linearly based on the attempt count. If all attempts fail, the last encountered error is thrown.
 *
 * @param fn - The asynchronous function to execute
 * @param attempts - The maximum number of attempts (default is 3)
 * @param delayMs - The base delay in milliseconds between retries (default is 500)
 * @returns The resolved value from the successful execution of `fn`
 * @throws The last error encountered if all attempts fail
 */
export async function retryAsync<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}
