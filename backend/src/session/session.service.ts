import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}
  async setSession(userId: string, sessionData: any) {
    const client = this.redisService.getClient();
    await client.set(
      `session:${userId}`,
      JSON.stringify(sessionData),
      'EX',
      3600,
    );
  }

  async getSession(userId: string) {
    const client = this.redisService.getClient();
    const data = await client.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string) {
    const client = this.redisService.getClient();
    await client.del(`session:${userId}`);
  }
}
