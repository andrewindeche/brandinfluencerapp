import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken('User'));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('loginInfluencer', () => {
    it('should return access and refresh tokens', async () => {
      const influencer: any = {
        _id: 'influencerId',
        username: 'influencer1',
        socialMediaHandles: {
          instagram: 'influencer_instagram',
        },
        category: 'fitness',
        bio: 'Fitness Enthusiast',
        location: 'New York',
        submissions: [],
        role: 'influencer',
        password: 'password',
        email: 'influencer@example.com',
        $assertPopulated: jest.fn(),
        $clearModifiedPaths: jest.fn(),
        $clone: jest.fn(),
        $createModifiedPathsSnapshot: jest.fn(),
      };

      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await authService.loginInfluencer(influencer);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(accessToken);
      expect(result).toHaveProperty('refresh_token');
      expect(result.refresh_token).toBe(refreshToken);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('loginBrand', () => {
    it('should return access and refresh tokens for brand', async () => {
      const brand: any = {
        _id: 'brandId',
        username: 'brand1',
        email: 'brand1@example.com',
        password: 'password',
        role: 'brand',
        $assertPopulated: jest.fn(),
        $clearModifiedPaths: jest.fn(),
        $clone: jest.fn(),
        $createModifiedPathsSnapshot: jest.fn(),
      };

      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await authService.loginBrand(brand);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(accessToken);
      expect(result).toHaveProperty('refresh_token');
      expect(result.refresh_token).toBe(refreshToken);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('loginSuperuser', () => {
    it('should return access and refresh tokens for superuser', async () => {
      const superuser = {
        username: 'superuser1',
        _id: 'superuserId',
        password: 'password',
      };
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(superuser);

      const result = await authService.loginSuperuser('superuser1', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(accessToken);
      expect(result).toHaveProperty('refresh_token');
      expect(result.refresh_token).toBe(refreshToken);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        authService.loginSuperuser('invalidUser', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateRefreshToken', () => {
    it('should return the user if refresh token is valid', async () => {
      const user = { username: 'user1', refreshToken: 'hashedToken' };

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await authService.validateRefreshToken('refreshToken');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.validateRefreshToken('invalidToken'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if username and password are correct', async () => {
      const user = { username: 'user1', password: 'hashedPassword' };
      const password = 'password';
      const role = 'brand';

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      jest.spyOn(bcryptjs, 'compare' as any).mockResolvedValue(true);

      const result = await authService.validateUser('user1', password, role);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = { username: 'user1', password: 'hashedPassword' };
      const password = 'wrongPassword';
      const role = 'brand';

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      jest.spyOn(bcryptjs, 'compare' as any).mockResolvedValue(false);

      await expect(
        authService.validateUser('user1', password, role),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        authService.validateUser('invalidUser', 'password', 'brand'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('registerInfluencer', () => {
    it('should register a new influencer', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'securepassword',
        confirmPassword: 'securepassword',
        role: 'influencer' as 'influencer',
        category: 'fashion',
        bio: 'I love fashion!',
        location: 'NYC',
      };
      const hashedPassword = 'hashedPassword';
      const newUser = {
        ...createUserDto,
        password: hashedPassword,
        role: 'influencer',
      };
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      jest.spyOn(bcryptjs, 'hash' as any).mockResolvedValue(hashedPassword);
      jest.spyOn(userModel, 'save').mockResolvedValue(newUser);

      const result = await authService.registerInfluencer(createUserDto);
      expect(result).toEqual(newUser);
    });

    it('should throw error if username or email already exists', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'securepassword',
        confirmPassword: 'securepassword',
        role: 'influencer' as 'influencer',
        category: 'fashion',
        bio: 'I love fashion!',
        location: 'NYC',
      };
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await expect(
        authService.registerInfluencer(createUserDto),
      ).rejects.toThrow('Username or email already exists.');
    });
  });

  describe('registerBrand', () => {
    it('should register a new brand', async () => {
      const createUserDto = {
        username: 'brand1',
        email: 'brand@domain.com',
        password: 'password',
        confirmPassword: 'password',
        role: 'brand' as 'brand',
      };

      const hashedPassword = 'hashedPassword';
      const newUser = {
        ...createUserDto,
        password: hashedPassword,
        role: 'brand',
      };

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      jest.spyOn(bcryptjs, 'hash' as any).mockResolvedValue(hashedPassword);

      (userModel as jest.Mock).mockImplementation(() => ({
        ...newUser,
        save: jest.fn().mockResolvedValue(newUser),
      }));

      const result = await authService.registerBrand(createUserDto);

      expect(result).toEqual(newUser);
    });

    it('should throw error if username or email already exists', async () => {
      const createUserDto = {
        username: 'brand1',
        email: 'brand@domain.com',
        password: 'password',
        confirmPassword: 'password',
        role: 'brand' as 'brand',
      };

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await expect(authService.registerBrand(createUserDto)).rejects.toThrow(
        'Username or email already exists.',
      );
    });
  });
});
