import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';


jest.mock('ioredis', () => {
  return class {
    set = jest.fn().mockResolvedValue('OK');
    get = jest.fn().mockResolvedValue('testdata');
    del = jest.fn().mockResolvedValue(1);
    keys = jest.fn().mockResolvedValue(['session:testuser']);
    quit = jest.fn().mockResolvedValue('OK');
    ttl = jest.fn().mockResolvedValue(5);
  };
});

describe('RedisService', () => {
  let redisService: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    const client = redisService.getClient();
    const keys = await client.keys('*');
    if (keys.length) await client.del(keys);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisService.getClient().quit();
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

  it('should set, get, and delete a token', async () => {
    await redisService.setToken('token:testuser', 'tokenvalue', 5);
    const token = await redisService.getToken('token:testuser');
    expect(token).toBe('tokenvalue');

    await redisService.deleteToken('token:testuser');
    const deletedToken = await redisService.getToken('token:testuser');
    expect(deletedToken).toBeNull();
  });

  it('should return false if key is not rate limited', async () => {
    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(false);
  });

  it('should return true after setting rate limit', async () => {
    await redisService.setRateLimit('rate:testuser', 5);
    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(true);
  });

  it('should throw an error if rate limited', async () => {
    await redisService.setRateLimit('rate:testuser', 5);
    await expect(
      redisService.rateLimitOrThrow('rate:testuser', 5),
    ).rejects.toThrow('Too many requests');
  });

  it('should not throw if not rate limited and then set rate limit', async () => {
    await expect(
      redisService.rateLimitOrThrow('rate:testuser', 5),
    ).resolves.toBeUndefined();

    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(true);
  });
});
