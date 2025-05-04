import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  const mRedis = jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    quit: jest.fn(),
    on: jest.fn((event, cb) => {
      if (event === 'error') cb && cb();
    }),
  }));
  return {
    __esModule: true,
    default: mRedis,
  };
});

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedisClient: Partial<Redis>;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (mockRedisClient.quit) {
      await mockRedisClient.quit();
    }
  });

  beforeEach(async () => {
    mockRedisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });

  it('should call set() when setValue is called', async () => {
    await redisService.setValue('key1', 'value1');
    expect(mockRedisClient.set).toHaveBeenCalledWith('key1', 'value1', 'EX', 3600);
  });

  it('should call get() when getValue is called', async () => {
    mockRedisClient.get = jest.fn().mockResolvedValue('value1');
    const result = await redisService.getValue('key1');
    expect(result).toBe('value1');
    expect(mockRedisClient.get).toHaveBeenCalledWith('key1');
  });

  it('should call del() when deleteValue is called', async () => {
    await redisService.deleteValue('key1');
    expect(mockRedisClient.del).toHaveBeenCalledWith('key1');
  });

  it('should return true if key exists in rateLimit check', async () => {
    mockRedisClient.exists = jest.fn().mockResolvedValue(1);
    const result = await redisService.isRateLimited('key1');
    expect(result).toBe(true);
    expect(mockRedisClient.exists).toHaveBeenCalledWith('key1');
  });

  it('should set rate limit key when rateLimitOrThrow is called', async () => {
    mockRedisClient.exists = jest.fn().mockResolvedValue(0);
    await redisService.rateLimitOrThrow('key1', 60);
    expect(mockRedisClient.set).toHaveBeenCalledWith('key1', '1', 'EX', 60);
  });

  it('should throw error if rate limit is exceeded', async () => {
    mockRedisClient.exists = jest.fn().mockResolvedValue(1);
    await expect(redisService.rateLimitOrThrow('key1', 60)).rejects.toThrow('Too many requests');
  });
});
