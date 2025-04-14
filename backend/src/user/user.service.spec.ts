import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let model: jest.Mocked<Model<User>>;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
          },
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
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue(users),
    } as any);

    expect(await service.findAll()).toEqual(users);
  });

  it('should create a user', async () => {
    const userData = { email: 'new@example.com', username: 'newuser' };
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    } as any);
    const mockUserInstance = {
      save: jest.fn().mockResolvedValue(userData),
    };
    jest.spyOn(model, 'create').mockReturnValue(mockUserInstance as any);

    expect(await service.createUser(userData as any)).toEqual(userData);
  });

  it('should not create a user if email or username exists', async () => {
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({ email: 'existing@example.com' }),
    } as any);

    await expect(
      service.createUser({ email: 'existing@example.com' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should find a user by email', async () => {
    const user = { email: 'test@example.com', username: 'testuser' };
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    } as any);

    expect(await service.findUserByEmail('test@example.com')).toEqual(user);
  });

  it('should update user password', async () => {
    const userId = '1234';
    const newPassword = 'newpassword';
    jest.spyOn(redisService, 'rateLimitOrThrow').mockResolvedValue();
    jest.spyOn(model, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ password: 'oldhashedpassword' }),
      }),
    } as unknown as ReturnType<typeof model.findById>);
    await expect(
      service.updatePassword(userId, newPassword),
    ).resolves.not.toThrow();
  });

  it('should throw error when new password matches old password', async () => {
    jest.spyOn(model, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ password: 'hashedpassword' }),
      }),
    } as unknown as ReturnType<typeof model.findById>);

    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    await expect(
      service.updatePassword('1234', 'hashedpassword'),
    ).rejects.toThrow('New password cannot be the same as the old password');
  });
});
