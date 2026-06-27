type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
  timestamp: string;
  correlationId?: string;
}

class Logger {
  private formatMessage(payload: LogPayload) {
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(payload);
    }
    const contextStr = payload.context ? ` ${JSON.stringify(payload.context)}` : '';
    const errStr = payload.error instanceof Error ? `\nStack: ${payload.error.stack}` : '';
    const corrStr = payload.correlationId ? ` [${payload.correlationId}]` : '';
    return `[${payload.timestamp}]${corrStr} [${payload.level.toUpperCase()}]: ${payload.message}${contextStr}${errStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown) {
    // Basic correlation ID extraction if we had AsyncLocalStorage setup, but we pass it explicitly in contexts for now.
    const correlationId = context?.correlationId;
    const payload: LogPayload = {
      level,
      message,
      context,
      error,
      timestamp: new Date().toISOString(),
      correlationId
    };

    const output = this.formatMessage(payload);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.info(output);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
