import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../user/user.schema';

jest.mock('../user/user.service');

describe('AdminService', () => {
  let adminService: AdminService;

  const mockSave = jest.fn();
  const mockFindOne = jest.fn();
  const mockFindById = jest.fn();
  const mockFind = jest.fn();
  const mockUser: Partial<User> = {
    _id: 'user123',
    username: 'superadmin',
    email: 'admin@example.com',
    password: 'hashedpassword',
    role: 'superuser',
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn().mockResolvedValue({
      _id: 'user123',
      username: 'superuser1',
      email: 'admin@example.com',
      password: 'hashedpassword',
      role: 'superuser',
      save: jest.fn().mockResolvedValue({
        _id: 'user123',
        username: 'superuser1',
        email: 'admin@example.com',
        password: 'hashedpassword',
        role: 'superuser',
      }),
    }),
    findById: mockFindById,
    find: mockFind,
    constructor: jest.fn().mockImplementation(() => ({
      save: mockSave,
    })),
  };

  const mockExec = (resolvedValue) => ({
    exec: jest.fn().mockResolvedValue(resolvedValue),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
  });

  describe('createSuperUser', () => {
    it('should create a superuser if one does not exist', async () => {
      const username = 'superuser1';
      const email = 'superuser1@example.com';
      const password = 'SuperSecretPassword';

      mockUserModel.findOne.mockReturnValue(mockExec(null));
      mockUserModel.create.mockResolvedValue({
        _id: 'user123',
        username,
        email,
        password: 'hashedPassword',
        role: 'superuser',
        save: mockSave,
      });

      const result = await adminService.createSuperUser(
        username,
        email,
        password,
      );

      expect(result).toHaveProperty('username', username);
      expect(result).toHaveProperty('role', 'superuser');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if a superuser already exists', async () => {
      const existingSuperUser = {
        _id: 'user123',
        username: 'superuser1',
        email: 'superuser1@example.com',
        password: 'hashedPassword',
        role: 'superuser',
      };
    
      jest.spyOn(mockUserModel, 'findOne').mockReturnValueOnce(mockExec(existingSuperUser));
    
      await expect(
        adminService.createSuperUser('name', 'email', 'pass'),
      ).rejects.toThrow('Superuser already exists.');
    });
  });

  describe('promoteUserToAdmin', () => {
    it('should promote a user to admin if superuser exists', async () => {
      const superUserId = 'superuserId';
      const userId = 'userId';

      const superUser = { _id: superUserId, role: 'superuser' };
      const user = {
        _id: userId,
        role: 'user',
        save: jest.fn().mockResolvedValue({ _id: userId, role: 'admin' }),
      };

      mockFindById
        .mockReturnValueOnce(mockExec(superUser))
        .mockReturnValueOnce(mockExec(user));

      const result = await adminService.promoteUserToAdmin(superUserId, userId);

      expect(result).toHaveProperty('role', 'admin');
    });

    it('should throw ForbiddenException if superuser is not found or incorrect', async () => {
      mockFindById.mockReturnValueOnce(mockExec(null));

      await expect(
        adminService.promoteUserToAdmin('superUserId', 'userId'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error if the user to promote does not exist', async () => {
      const superUser = { _id: 'id', role: 'superuser' };

      mockFindById
        .mockReturnValueOnce(mockExec(superUser))
        .mockReturnValueOnce(mockExec(null));

      await expect(
        adminService.promoteUserToAdmin('superUserId', 'userId'),
      ).rejects.toThrow('User not found.');
    });
  });

  describe('findAllUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ username: 'user1' }, { username: 'user2' }];

      mockFind.mockReturnValue(mockExec(users));

      const result = await adminService.findAllUsers();

      expect(result).toEqual(users);
    });
  });
});
