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
}
