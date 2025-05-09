import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { bootstrap } from './main';

jest.mock('express-rate-limit', () => {
  return {
    __esModule: true,
    default: jest.fn(() => (next: any) => next()),
  };
});

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      call: jest.fn().mockResolvedValue('OK'),
    })),
  };
});

jest.mock('cookie-parser', () => jest.fn());

(NestFactory.create as unknown) = jest.fn();

describe('Bootstrap (main.ts)', () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      useGlobalFilters: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockImplementation((token) => {
        if (token.name === 'AdminService') {
          return { bootstrapSuperUserFromEnv: jest.fn() };
        }
        return {};
      }),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.PORT = '4001';
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should bootstrap the app without throwing', async () => {
    await bootstrap();
    await new Promise((resolve) => setImmediate(resolve));

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.use).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.any(Array),
        methods: expect.any(String),
        allowedHeaders: expect.any(Array),
        credentials: true,
      }),
    );
    expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith('4001');
  });
});
