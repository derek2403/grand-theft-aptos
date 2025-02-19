class TransactionError extends Error {
  constructor(message, code, isRetryable) {
    super(message);
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

const isRetryableError = (error) => {
  const retryableCodes = ['network_error', 'timeout', 'server_busy'];
  return error instanceof TransactionError && error.isRetryable;
};

async function executeWithRetry(operation, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}

export { TransactionError, executeWithRetry, isRetryableError }; 