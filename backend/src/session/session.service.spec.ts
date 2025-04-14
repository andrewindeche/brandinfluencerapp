import { SessionService } from './session.service';
import { RedisService } from 'src/redis/redis.service';

describe('SessionService', () => {
  let sessionService: SessionService;
  let redisService: jest.Mocked<RedisService>;
  let redisClient: {
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
  };

  beforeEach(() => {
    redisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    redisService = {
      getClient: jest.fn(() => redisClient),
    } as any;

    sessionService = new SessionService(redisService);
  });

  describe('setSession', () => {
    it('should store session data with expiration', async () => {
      const userId = 'user123';
      const sessionData = { email: 'test@example.com' };

      await sessionService.setSession(userId, sessionData);

      expect(redisClient.set).toHaveBeenCalledWith(
        `session:${userId}`,
        JSON.stringify(sessionData),
        'EX',
        3600,
      );
    });
  });

  describe('getSession', () => {
    it('should return parsed session data if found', async () => {
      const userId = 'user123';
      const sessionData = { role: 'brand' };

      redisClient.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await sessionService.getSession(userId);
      expect(result).toEqual(sessionData);
    });

    it('should return null if session not found', async () => {
      const userId = 'user123';

      redisClient.get.mockResolvedValue(null);

      const result = await sessionService.getSession(userId);
      expect(result).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('should call redis del with correct key', async () => {
      const userId = 'user123';

      await sessionService.deleteSession(userId);

      expect(redisClient.del).toHaveBeenCalledWith(`session:${userId}`);
    });
  });
});
