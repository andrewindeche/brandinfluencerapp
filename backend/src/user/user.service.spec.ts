import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let redisService: RedisService;

  const mockSave = jest.fn();
  const mockFind = jest.fn();
  const mockFindOne = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();

  const mockUserModelConstructor = jest.fn().mockImplementation((userData) => ({
    ...userData,
    save: mockSave,
  }));

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: Object.assign(mockUserModelConstructor, {
            find: mockFind,
            findOne: mockFindOne,
            findById: mockFindById,
            findByIdAndUpdate: mockFindByIdAndUpdate,
          }),
        },
        {
          provide: RedisService,
          useValue: {
            rateLimitOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should fetch all users', async () => {
    const users = [{ email: 'test@example.com', username: 'testuser' }];
    mockFind.mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });

    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should find a user by email', async () => {
    const user = { email: 'test@example.com', username: 'testuser' };
    mockFindOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

    const result = await service.findUserByEmail('test@example.com');
    expect(result).toEqual(user);
  });

  it('should update user password', async () => {
    const userId = '1234';
    const newPassword = 'newpassword';
    const oldPassword = 'oldpassword';
    const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

    jest.spyOn(redisService, 'rateLimitOrThrow').mockResolvedValue();

    mockFindById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          password: hashedOldPassword,
          save: jest.fn().mockResolvedValue(true),
        }),
      }),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    await expect(
      service.updatePassword(userId, newPassword),
    ).resolves.not.toThrow();
  });

  it('should throw error when new password matches old password', async () => {
    const hashed = await bcrypt.hash('samepassword', 10);
    mockFindById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          password: hashed,
        }),
      }),
    } as any);

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    await expect(
      service.updatePassword('1234', 'samepassword'),
    ).rejects.toThrow('New password cannot be the same as the old password');
  });
});
