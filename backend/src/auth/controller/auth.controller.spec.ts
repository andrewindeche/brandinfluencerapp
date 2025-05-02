import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { SessionService } from '../../session/session.service';
import { ForgotPasswordService } from '../../forgot-password/forgot-password.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as supertest from 'supertest';

describe('AuthController', () => {
  let authService: AuthService;
  let sessionService: SessionService;
  let forgotPasswordService: ForgotPasswordService;
  let jwtService: JwtService;
  let app: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        SessionService,
        ForgotPasswordService,
        UserService,
        JwtService,
      ],
    })
      .overrideProvider(AuthService)
      .useValue({
        loginInfluencer: jest.fn(),
        loginBrand: jest.fn(),
        validateUser: jest.fn(),
        registerInfluencer: jest.fn(),
        registerBrand: jest.fn(),
        validateRefreshToken: jest.fn(),
      })
      .overrideProvider(SessionService)
      .useValue({
        setSession: jest.fn(),
      })
      .overrideProvider(ForgotPasswordService)
      .useValue({
        sendResetEmail: jest.fn(),
        validateToken: jest.fn(),
        invalidateToken: jest.fn(),
      })
      .overrideProvider(UserService)
      .useValue({
        findUserByEmail: jest.fn(),
        updatePassword: jest.fn(),
      })
      .overrideProvider(JwtService)
      .useValue({
        sign: jest.fn(),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get<AuthService>(AuthService);
    sessionService = module.get<SessionService>(SessionService);
    forgotPasswordService = module.get<ForgotPasswordService>(
      ForgotPasswordService,
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/influencer/login', () => {
    it('should login influencer and return tokens', async () => {
      const loginDto = { username: 'influencer1', password: 'password123' };
      const mockUser = { id: '1', username: 'influencer1', role: 'influencer' };
      const mockTokens = {
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'loginInfluencer').mockResolvedValue(mockTokens);
      jest.spyOn(sessionService, 'setSession').mockResolvedValue(undefined);

      const response = await supertest(app.getHttpServer())
        .post('/auth/influencer/login')
        .send(loginDto)
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'influencer1', password: 'wrongpassword' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await supertest(app.getHttpServer())
        .post('/auth/influencer/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/brand/login', () => {
    it('should login brand and return tokens', async () => {
      const loginDto = { username: 'brand1', password: 'password123' };
      const mockUser = { id: '1', username: 'brand1', role: 'brand' };
      const mockTokens = {
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'loginBrand').mockResolvedValue(mockTokens);
      jest.spyOn(sessionService, 'setSession').mockResolvedValue(undefined);

      const response = await supertest(app.getHttpServer())
        .post('/auth/brand/login')
        .send(loginDto)
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'brand1', password: 'wrongpassword' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await supertest(app.getHttpServer())
        .post('/auth/brand/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/influencer/register', () => {
    it('should register influencer successfully', async () => {
      const registerDto = {
        username: 'influencer1',
        _id: '1',
        email: 'test@domain.com',
        password: 'password123',
        category: 'fitness',
        bio: 'Bio',
        location: 'NY',
      };
      const newUser = {
        id: '1',
        username: 'influencer1',
        _id: '1',
        email: 'test@domain.com',
        password: 'password123',
        category: 'fitness',
        bio: 'Bio',
        location: 'NY',
        role: 'influencer',
      } as any;

      jest.spyOn(authService, 'registerInfluencer').mockResolvedValue(newUser);

      const response = await supertest(app.getHttpServer())
        .post('/auth/influencer/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.username).toBe('influencer1');
      expect(response.body.email).toBe('test@domain.com');
    });

    it('should throw ConflictException if email or username already exists', async () => {
      const registerDto = {
        username: 'influencer1',
        email: 'test@domain.com',
        password: 'password123',
        category: 'fitness',
        bio: 'Bio',
        location: 'NY',
      };

      jest
        .spyOn(authService, 'registerInfluencer')
        .mockRejectedValue(new Error('Email or username already exists.'));

      await supertest(app.getHttpServer())
        .post('/auth/influencer/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refreshToken';
      const mockUser = {
        _id: '1',
        username: 'influencer1',
        role: 'influencer',
        password: 'password123',
        email: 'influencer1@example.com',
      } as any;
      const newAccessToken = 'newAccessToken';

      jest
        .spyOn(authService, 'validateRefreshToken')
        .mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(newAccessToken);

      const response = await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body.access_token).toBe(newAccessToken);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalidToken';

      jest.spyOn(authService, 'validateRefreshToken').mockResolvedValue(null);

      await supertest(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send a password reset email', async () => {
      const forgotPasswordDto = { email: 'user@domain.com' };
      const previewLink = 'resetLink';

      jest
        .spyOn(forgotPasswordService, 'sendResetEmail')
        .mockResolvedValue(previewLink);

      const response = await supertest(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordDto)
        .expect(201);

      expect(response.body.message).toBe('Reset email sent.');
      expect(response.body.previewLink).toBe(previewLink);
    });
  });
});
