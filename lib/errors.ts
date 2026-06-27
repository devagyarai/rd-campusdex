import { NextResponse } from 'next/server';
import { logger } from './logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export function handleApiError(error: unknown, correlationId?: string) {
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error(`[${error.errorCode}] ${error.message}`, error, { correlationId });
    } else {
      logger.warn(`[${error.errorCode}] ${error.message}`, { correlationId });
    }
    return NextResponse.json({
      error: error.message,
      code: error.errorCode,
    }, { status: error.statusCode });
  }

  // Fallback for unhandled exceptions (Prisma errors, Node errors, etc.)
  logger.error('Unhandled Server Exception', error, { correlationId });
  
  // In production, we swallow the actual stack trace / DB error for security.
  const isProd = process.env.NODE_ENV === 'production';
  return NextResponse.json({
    error: isProd ? 'Internal Server Error' : (error as Error).message,
    code: 'INTERNAL_SERVER_ERROR'
  }, { status: 500 });
}
