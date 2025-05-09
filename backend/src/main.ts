import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import RateLimitRedisStore, { RedisReply } from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import { MongoExceptionFilter } from '../filters/mongo-exception.filter';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { AdminService } from './admin/admin.service';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not defined. Set it in your .env file or environment variables.',
  );
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const adminService = app.get(AdminService);
  await adminService.bootstrapSuperUserFromEnv();
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  });

  app.use(
    rateLimit({
      store: new RateLimitRedisStore({
        sendCommand: async (
          command: string,
          ...args: string[]
        ): Promise<RedisReply> => {
          return (await redisClient.call(command, ...args)) as RedisReply;
        },
      }),
      windowMs: 30 * 60 * 1000,
      max: 8,
      message: 'Too many login attempts. Please try again later.',
    }),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.useGlobalFilters(new MongoExceptionFilter(), new AllExceptionsFilter());

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}

if (require.main === module) {
  bootstrap();
}
