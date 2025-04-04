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

  async setValue(key: string, value: string, ttl?: number) {
    await this.client.set(key, value, 'EX', ttl || 3600);
  }

  async getValue(key: string) {
    return await this.client.get(key);
  }

  async deleteValue(key: string) {
    await this.client.del(key);
  }
}
