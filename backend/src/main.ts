import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import RateLimitRedisStore, { RedisReply } from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisClient = new Redis();

  app.use(
    rateLimit({
      store: new RateLimitRedisStore({
        sendCommand: async (command: string, ...args: string[]): Promise<RedisReply> => {
          return await redisClient.call(command, ...args) as RedisReply;
        }
      }),
      windowMs: 15 * 60 * 1000,
      max: 30,
      message: 'Too many login attempts. Please try again later.',
    }),
  );
  
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
