import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

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
      const result: jest.Mocked<User>[] = [
        {
          email: 'test@example.com',
          username: 'testuser',
          role: 'influencer',
          password: '',
          _id: new mongoose.Types.ObjectId().toString(),
        } as unknown as jest.Mocked<User>,
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('getUserType', () => {
    it('should return user type based on role', async () => {
      const user = {
        email: 'test@example.com',
        role: 'brand',
        username: 'testuser',
        password: 'hashedpassword',
        _id: new mongoose.Types.ObjectId(),
      } as unknown as User;
      jest.spyOn(service, 'findUserByEmail').mockResolvedValue(user);
      const result = await controller.getUserType('test@example.com');
      expect(result).toEqual({ type: 'brand' });
    });

    it('should return "brand" if user role is not influencer', async () => {
      const user = {
        email: 'test@example.com',
        role: 'brand',
        username: 'testuser',
        password: 'hashedpassword',
        _id: new mongoose.Types.ObjectId(),
      } as unknown as User;

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
