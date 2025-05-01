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

jest.setTimeout(60000);

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let userModel: mongoose.Model<User>;

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

    console.log('MongoMemoryServer URI:', uri);
    process.env.MONGO_URI = uri;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        AppModule,
      ],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<mongoose.Model<User>>(getModelToken('User'));
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('/admin/promote (POST)', async () => {
    const superUser = await userModel.create({
      email: 'superadmin@test.com',
      password: await bcrypt.hash('password', 10),
      role: 'superuser',
      username: 'superadmin',
    });

    const userToPromote = await userModel.create({
      email: 'user@test.com',
      password: await bcrypt.hash('password', 10),
      role: 'influencer',
      username: 'user',
    });

    const token = generateJwtToken(superUser._id.toString(), 'superuser');

    const response = await request(app.getHttpServer())
      .post('/admin/promote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        superUserId: superUser._id.toString(),
        userId: userToPromote._id.toString(),
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.role).toBe('admin');
  });
});

function generateJwtToken(userId: string, role: string) {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' },
  );
}
