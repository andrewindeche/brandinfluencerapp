import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

@Catch(Error) 
export class DatabaseUnavailableFilter implements ExceptionFilter { 
  catch(exception: Error, host: ArgumentsHost) 
  { const ctx = host.switchToHttp(); 
    const response = ctx.getResponse(); 
    if (exception.message.includes('ECONNREFUSED') 
      || exception.message.includes('failed to connect')) 
    { response.status(HttpStatus.SERVICE_UNAVAILABLE).json(
      { code: 'DB_UNAVAILABLE', 
        message: 'Login service unavailable. Please try again later.', 
        timestamp: new Date().toISOString(), }); } 
        else { response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
          { code: 'SERVER_ERROR', message: 'An unexpected error occurred.', 
            timestamp: new Date().toISOString(), }); 
          } 
        } 
      }