import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: 6380,
    });
  }

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

  async rateLimitOrThrow(key: string, ttlSeconds: number, message = 'Too many requests'): Promise<void> {
    const isLimited = await this.isRateLimited(key);
    if (isLimited) throw new Error(message);
    await this.setRateLimit(key, ttlSeconds);
  }
}
