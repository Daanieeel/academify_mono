import { Elysia } from 'elysia';
import { PermissionError } from '@repo/permissions';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorPlugin = new Elysia({ name: 'error-plugin' }).onError(
  { as: 'global' },
  ({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    if (error instanceof PermissionError) {
      set.status = 403;
      return {
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    // Handle Elysia's built-in validation errors
    if (code === 'VALIDATION') {
      set.status = 422;
      return {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: error.all,
        },
      };
    }

    // Default fallback
    set.status = 500;
    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
    };
  },
);
