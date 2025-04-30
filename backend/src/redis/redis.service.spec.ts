import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

jest.mock('ioredis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn().mockResolvedValue([]),
  incr: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
}));

describe('RedisService', () => {
  let redisService: RedisService;
  let mockClient: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    mockClient = redisService.getClient();
  });

  afterEach(async () => {
    const keys = await mockClient.keys('*');
    if (keys.length) await mockClient.del(keys);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisService.getClient().quit();
  });

  it('should set and retrieve session data', async () => {
    const key = 'sessionKey';
    const value = 'sessionValue';
    mockClient.get.mockResolvedValueOnce(value);
    await redisService.setValue(key, value);
    const sessionValue = await redisService.getValue(key);
    expect(sessionValue).toBe(value);
    mockClient.set.mockReset();
  });

  it('should delete session data', async () => {
    mockClient.get.mockResolvedValueOnce(null);
    await redisService.setValue('session:testuser', 'testdata');
    await redisService.deleteValue('session:testuser');
    const data = await redisService.getValue('session:testuser');
    expect(data).toBeNull();
  });

  it('should set, get, and delete a token', async () => {
    mockClient.get.mockResolvedValueOnce('tokenvalue');
    await redisService.setToken('token:testuser', 'tokenvalue', 5);
    const token = await redisService.getToken('token:testuser');
    expect(token).toBe('tokenvalue');

    mockClient.get.mockResolvedValueOnce(null);
    await redisService.deleteToken('token:testuser');
    const deletedToken = await redisService.getToken('token:testuser');
    expect(deletedToken).toBeNull();
  });

  it('should return false if key is not rate limited', async () => {
    mockClient.exists.mockResolvedValueOnce(0);
    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(false);
  });

  it('should return true after setting rate limit', async () => {
    mockClient.exists.mockResolvedValueOnce(1);
    await redisService.setRateLimit('rate:testuser', 5);
    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(true);
  });

  it('should throw an error if rate limited', async () => {
    mockClient.exists.mockResolvedValue(1);
    await redisService.setRateLimit('rate:testuser', 5);
    await expect(
      redisService.rateLimitOrThrow('rate:testuser', 5),
    ).rejects.toThrow('Too many requests');
  });

  it('should not throw if not rate limited and then set rate limit', async () => {
    mockClient.exists.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

    await expect(
      redisService.rateLimitOrThrow('rate:testuser', 5),
    ).resolves.toBeUndefined();

    const isLimited = await redisService.isRateLimited('rate:testuser');
    expect(isLimited).toBe(true);
  });
});
