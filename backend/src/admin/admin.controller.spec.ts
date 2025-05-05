import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { RedisService } from '../redis/redis.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import * as jwt from 'jsonwebtoken';
import { SessionAuthGuard } from '../session-auth/session-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

jest.setTimeout(60000);

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: mongoose.Model<User>;
  let superUserId: string;

  const mockRedisService = {
    getValue: jest.fn().mockResolvedValue(null),
    setValue: jest.fn().mockResolvedValue('OK'),
    deleteValue: jest.fn().mockResolvedValue(1),
    setToken: jest.fn().mockResolvedValue('OK'),
    getToken: jest.fn().mockResolvedValue(null),
    deleteToken: jest.fn().mockResolvedValue(1),
    isRateLimited: jest.fn().mockResolvedValue(false),
    setRateLimit: jest.fn().mockResolvedValue('OK'),
    rateLimitOrThrow: jest.fn().mockResolvedValue(undefined),
    getClient: jest.fn().mockReturnValue({
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
    }),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;

    const standaloneConnection = await mongoose
      .createConnection(uri)
      .asPromise();
    const StandaloneUserModel = standaloneConnection.model<User>(
      'User',
      UserSchema,
    );
    const superUser = await StandaloneUserModel.create({
      email: 'superadmin@test.com',
      password: await bcrypt.hash('password', 10),
      role: 'superuser',
      username: 'superadmin',
    });
    superUserId = superUser._id.toString();
    await standaloneConnection.close();

    const moduleBuilder = Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        AppModule,
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue({
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        request.user = {
          id: superUserId,
          role: 'superuser',
          username: 'superadmin',
        };
        return true;
      },
    });

    moduleBuilder.overrideGuard(SessionAuthGuard).useValue({
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        request.user = {
          id: superUserId,
          role: 'superuser',
          username: 'superadmin',
        };
        return true;
      },
    });

    moduleBuilder.overrideProvider(RedisService).useValue(mockRedisService);

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = app.get(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await mongoose.disconnect();
    await mongod.stop();

    const redisClient = mockRedisService.getClient();
    await redisClient.quit();

    jest.clearAllTimers();
  });

  it('/admin/promote (POST)', async () => {
    const userToPromote = await userModel.create({
      email: 'user@test.com',
      password: await bcrypt.hash('password', 10),
      role: 'influencer',
      username: 'user',
    });

    const token = generateJwtToken(superUserId, 'superuser', 'superadmin');

    const response = await request(app.getHttpServer())
      .post('/admin/promote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        superUserId,
        userId: userToPromote._id.toString(),
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.role).toBe('admin');
  });
});

function generateJwtToken(userId: string, role: string, username: string) {
  return jwt.sign(
    { sub: userId, role, username },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' },
  );
}
