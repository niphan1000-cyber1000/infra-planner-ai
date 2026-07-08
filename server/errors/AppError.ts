export class AppError extends Error {
  public statusCode: number;
  public isTransient: boolean;

  constructor(message: string, statusCode = 500, isTransient = false) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isTransient = isTransient;
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, false);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429, true);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, true);
  }
}

/**
 * Checks if a thrown error is transient (e.g. rate limit, timeout, network error, 500, 503).
 * This is used to decide whether to retry the API request.
 */
export const isTransientError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.isTransient;
  }

  const errorMessage = (error?.message || String(error)).toLowerCase();
  const status = error?.status || error?.statusCode;
  const errorCode = error?.code;

  // 1. Check HTTP Status Codes for transient states: 429 (Too Many Requests), 500 (Internal Server Error), 503 (Service Unavailable)
  if (status === 429 || status === 500 || status === 503) {
    return true;
  }

  // 2. Check Network level / System level errors
  if (
    errorCode === "ETIMEDOUT" ||
    errorCode === "ECONNRESET" ||
    errorCode === "EHOSTUNREACH" ||
    errorCode === "ENETUNREACH" ||
    errorCode === "ECONNREFUSED" ||
    errorCode === "EPIPE" ||
    errorCode === "ECONNABORTED"
  ) {
    return true;
  }

  // 3. Check error name or specific classes
  const errorName = error?.name;
  if (
    errorName === "AbortError" ||
    errorName === "RequestAbortedError" ||
    errorName === "APIUserAbortError"
  ) {
    return true;
  }

  // 4. Check text-based patterns indicating transient failure (timeouts, rate limits, overloaded, network fails)
  if (
    errorMessage.includes("429") ||
    errorMessage.includes("500") ||
    errorMessage.includes("503") ||
    errorMessage.includes("resource_exhausted") ||
    errorMessage.includes("quota exceeded") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("abort") ||
    errorMessage.includes("service unavailable") ||
    errorMessage.includes("unavailable") ||
    errorMessage.includes("overloaded") ||
    errorMessage.includes("fetch failed") ||
    errorMessage.includes("network error")
  ) {
    return true;
  }

  return false;
};
