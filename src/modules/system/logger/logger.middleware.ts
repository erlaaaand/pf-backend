import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const responseTime = Date.now() - start;

      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      let logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} [${responseTime}ms]`;

      if (isDev) {
        // Mode Development: Tambahkan log mendetail (Query, Body, Params)
        const sanitize = (data: unknown) => {
          if (!data || typeof data !== 'object') return data;
          const sanitized = { ...(data as Record<string, unknown>) };
          if (sanitized.password) sanitized.password = '***';
          if (sanitized.token) sanitized.token = '***';
          if (sanitized.refreshToken) sanitized.refreshToken = '***';
          return sanitized;
        };

        const details = {
          body: Object.keys(req.body || {}).length
            ? sanitize(req.body)
            : undefined,
          query: Object.keys(req.query || {}).length ? req.query : undefined,
          params: Object.keys(req.params || {}).length ? req.params : undefined,
        };

        const detailString = Object.values(details).some((v) => v !== undefined)
          ? `\nDetails: ${JSON.stringify(details, null, 2)}`
          : '';

        logMessage += detailString;
      }

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
