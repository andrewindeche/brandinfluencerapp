import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import { ForbiddenException } from '@nestjs/common';

jest.mock('../user/user.service');
jest.setTimeout(15000);

const mockMongooseExec = (returnValue: any) => ({
  exec: jest.fn().mockResolvedValue(returnValue),
});

describe('AdminService', () => {
  let adminService: AdminService;
  let userModel: Model<User>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            exec: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    userService = module.get<UserService>(UserService);
  });

  describe('createSuperUser', () => {
    it('should create a superuser if one does not exist', async () => {
      const username = 'superuser1';
      const email = 'superuser1@example.com';
      const password = 'SuperSecretPassword';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(userModel.prototype, 'save').mockResolvedValue({
        username,
        email,
        password: 'hashedPassword',
        role: 'superuser',
      });

      const result = await adminService.createSuperUser(
        username,
        email,
        password,
      );
      expect(result).toHaveProperty('username', username);
      expect(result).toHaveProperty('role', 'superuser');
    });

    it('should throw an error if a superuser already exists', async () => {
      const username = 'superuser1';
      const email = 'superuser1@example.com';
      const password = 'SuperSecretPassword';

      jest.spyOn(userModel, 'findOne').mockResolvedValue({ role: 'superuser' });

      await expect(
        adminService.createSuperUser(username, email, password),
      ).rejects.toThrow('Superuser already exists.');
    });
  });

  describe('promoteUserToAdmin', () => {
    it('should promote a user to admin if superuser exists', async () => {
      const superUserId = 'superuserId';
      const userId = 'userId';

      const superUser = { _id: superUserId, role: 'superuser' };
      const user = { _id: userId, role: 'user' };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(superUser);
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(user);
      jest
        .spyOn(userModel.prototype, 'save')
        .mockResolvedValue({ ...user, role: 'admin' });

      const result = await adminService.promoteUserToAdmin(superUserId, userId);
      expect(result).toHaveProperty('role', 'admin');
    });

    it('should throw ForbiddenException if superuser is not found or has incorrect role', async () => {
      const superUserId = 'superuserId';
      const userId = 'userId';

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        adminService.promoteUserToAdmin(superUserId, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error if the user to promote does not exist', async () => {
      const superUserId = 'superuserId';
      const userId = 'userId';

      const superUser = { _id: superUserId, role: 'superuser' };
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(superUser);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(
        adminService.promoteUserToAdmin(superUserId, userId),
      ).rejects.toThrow('User not found.');
    });
  });

  describe('findAllUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ username: 'user1' }, { username: 'user2' }];
      const mockMongooseExec = <T>(returnValue: T) => ({
        exec: jest.fn().mockResolvedValue(returnValue),
      });
      jest.spyOn(userModel, 'find').mockReturnValue(mockMongooseExec(users) as any);
      const result = await adminService.findAllUsers();
      expect(result).toEqual(users);
    });
  });
});
