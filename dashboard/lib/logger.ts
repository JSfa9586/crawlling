/**
 * 로깅 레벨 정의
 * 로그 심각도에 따라 필터링하는 데 사용됨
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, any>;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * 로그 포매팅
   */
  private formatLog(context: LogContext): string {
    const { timestamp, level, message, data, duration, error } = context;

    let log = `[${timestamp}] [${level}] ${message}`;

    if (data && Object.keys(data).length > 0) {
      log += ` | ${JSON.stringify(data)}`;
    }

    if (duration !== undefined) {
      log += ` | ${duration}ms`;
    }

    if (error) {
      log += ` | ${error.name}: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        log += `\n${error.stack}`;
      }
    }

    return log;
  }

  /**
   * 내부 로그 출력
   */
  private output(level: LogLevel, message: string, context?: Omit<LogContext, 'level' | 'message' | 'timestamp'>) {
    if (level < this.level) return;

    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: levels[level],
      message,
      ...context,
    };

    const formattedLog = this.formatLog(logContext);

    // Vercel에서는 JSON 형식으로 로깅
    if (process.env.VERCEL || !this.isDevelopment) {
      console.log(JSON.stringify(logContext));
    } else {
      // 로컬 환경에서는 포매팅된 형식으로 로깅
      if (level === LogLevel.ERROR) {
        console.error(formattedLog);
      } else if (level === LogLevel.WARN) {
        console.warn(formattedLog);
      } else {
        console.log(formattedLog);
      }
    }
  }

  /**
   * 디버그 로그
   */
  debug(message: string, data?: Record<string, any>) {
    this.output(LogLevel.DEBUG, message, { data });
  }

  /**
   * 정보 로그
   */
  info(message: string, data?: Record<string, any>) {
    this.output(LogLevel.INFO, message, { data });
  }

  /**
   * 경고 로그
   */
  warn(message: string, data?: Record<string, any>) {
    this.output(LogLevel.WARN, message, { data });
  }

  /**
   * 에러 로그
   */
  error(message: string, error?: Error, data?: Record<string, any>) {
    this.output(LogLevel.ERROR, message, {
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  /**
   * 타이머 시작 및 종료
   */
  startTimer(): () => number {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      return duration;
    };
  }

  /**
   * API 요청 로깅 (시작시)
   */
  logApiRequest(method: string, path: string, query?: Record<string, any>) {
    this.info('API Request', {
      method,
      path,
      query,
    });
  }

  /**
   * API 응답 로깅
   */
  logApiResponse(method: string, path: string, status: number, duration: number) {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.output(level, 'API Response', {
      data: {
        method,
        path,
        status,
      },
      duration,
    });
  }

  /**
   * API 에러 로깅
   */
  logApiError(method: string, path: string, error: Error, statusCode: number = 500) {
    this.error(`API Error: ${method} ${path}`, error, {
      statusCode,
    });
  }
}

// 로거 인스턴스 생성
export const logger = new Logger();

/**
 * API 핸들러 래퍼 함수
 */
export function createApiHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    const timer = logger.startTimer();
    const url = new URL(req.url);

    try {
      logger.logApiRequest(req.method, url.pathname, Object.fromEntries(url.searchParams));

      const response = await handler(req);
      const duration = timer();

      logger.logApiResponse(req.method, url.pathname, response.status, duration);

      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.logApiError(req.method, url.pathname, err, 500);

      return new Response(
        JSON.stringify({
          success: false,
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * 성능 측정 데코레이터
 */
export function measurePerformance(_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const timer = logger.startTimer();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = timer();
      logger.info(`${propertyKey} completed`, { duration });
      return result;
    } catch (error) {
      const duration = timer();
      logger.error(`${propertyKey} failed`, error instanceof Error ? error : new Error(String(error)), { duration });
      throw error;
    }
  };

  return descriptor;
}

export default logger;
