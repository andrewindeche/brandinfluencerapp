import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import RateLimitRedisStore, { RedisReply } from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisClient = new Redis();

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
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
