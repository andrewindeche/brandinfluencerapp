import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}
  getClient(): Redis {
    return this.client;
  }

  async setValue(key: string, value: string, ttl?: number) {
    await this.client.set(key, value, 'EX', ttl || 3600);
  }

  async getValue(key: string) {
    return await this.client.get(key);
  }

  async deleteValue(key: string) {
    await this.client.del(key);
  }

  async setToken(key: string, value: string, ttl: number) {
    await this.client.set(key, value, 'EX', ttl);
  }

  async getToken(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async deleteToken(key: string) {
    await this.client.del(key);
  }

  async isRateLimited(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async setRateLimit(key: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, '1', 'EX', ttlSeconds);
  }

  async rateLimitOrThrow(
    key: string,
    ttlSeconds: number,
    message = 'Too many requests',
  ): Promise<void> {
    const isLimited = await this.isRateLimited(key);
    if (isLimited) throw new BadRequestException(message);
    await this.setRateLimit(key, ttlSeconds);
  }

  async incrementCounterRateLimit(
    key: string,
    maxCount: number,
    ttlSeconds: number,
  ): Promise<number> {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    if (current > maxCount) {
      throw new BadRequestException(
        `Rate limit exceeded. Maximum ${maxCount} joins per campaign allowed per session.`,
      );
    }
    return current;
  }

  async getCounterValue(key: string): Promise<number> {
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async decrementCounter(key: string): Promise<number> {
    const current = await this.client.decr(key);
    return current;
  }
}
