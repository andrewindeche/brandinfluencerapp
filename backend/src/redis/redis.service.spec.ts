import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let redisService: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  it('should set and retrieve session data', async () => {
    await redisService.setValue('session:testuser', 'testdata');
    const data = await redisService.getValue('session:testuser');
    expect(data).toBe('testdata');
  });

  it('should delete session data', async () => {
    await redisService.setValue('session:testuser', 'testdata');
    await redisService.deleteValue('session:testuser');
    const data = await redisService.getValue('session:testuser');
    expect(data).toBeNull();
  });
});
