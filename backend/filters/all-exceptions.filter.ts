import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const status =
        exception instanceof HttpException ? exception.getStatus() : 500;
  
      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : (exception as Error).message;
  
      this.logger.error(
        `Status: ${status}, Message: ${JSON.stringify(message)}, Path: ${
          request.url
        }`,
        (exception as Error).stack,
      );
  
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
  