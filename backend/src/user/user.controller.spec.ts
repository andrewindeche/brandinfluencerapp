import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.schema';
import { ConflictException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: User[] = [
        {
          email: 'test@example.com',
          username: 'testuser',
          role: 'influencer',
          password: '',
          _id: new mongoose.Types.ObjectId().toString(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create a user and return the user', async () => {
      const userData = { email: 'new@example.com', username: 'newuser' };
      const result: User = { ...userData, role: 'brand' };
      jest.spyOn(service, 'createUser').mockResolvedValue(result);

      expect(await controller.create(userData)).toEqual(result);
    });

    it('should throw ConflictException if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
      };
      jest
        .spyOn(service, 'createUser')
        .mockRejectedValue(new ConflictException('User already exists'));

      await expect(controller.create(userData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getUserType', () => {
    it('should return user type based on role', async () => {
      const user = { email: 'test@example.com', role: 'influencer' };
      jest.spyOn(service, 'findUserByEmail').mockResolvedValue(user);

      const result = await controller.getUserType('test@example.com');
      expect(result).toEqual({ type: 'influencer' });
    });

    it('should return "brand" if user role is not influencer', async () => {
      const user = { email: 'test@example.com', role: 'brand' };
      jest.spyOn(service, 'findUserByEmail').mockResolvedValue(user);

      const result = await controller.getUserType('test@example.com');
      expect(result).toEqual({ type: 'brand' });
    });

    it('should return "unknown" if user is not found', async () => {
      jest.spyOn(service, 'findUserByEmail').mockResolvedValue(null);

      const result = await controller.getUserType('unknown@example.com');
      expect(result).toEqual({ type: 'unknown' });
    });
  });
});
