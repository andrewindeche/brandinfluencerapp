import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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

jest.mock('dotenv', () => ({
  config: jest.fn().mockImplementation(() => ({
    parsed: {
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      PORT: '4001',
      JWT_SECRET: 'test-secret',
    },
  })),
  parse: jest.fn().mockReturnValue({
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    PORT: '4001',
    JWT_SECRET: 'test-secret',
  }),
}));

jest.mock('cookie-parser', () => jest.fn());

(NestFactory.create as unknown) = jest.fn();

describe('Bootstrap (main.ts)', () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.PORT = '4001';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should bootstrap the app without throwing', async () => {
    require('./main');
    await new Promise((resolve) => setImmediate(resolve));

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.use).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({ origin: expect.any(Array) }),
    );
    expect(mockApp.listen).toHaveBeenCalledWith('4001');
  });
});
