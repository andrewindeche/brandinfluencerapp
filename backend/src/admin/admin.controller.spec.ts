import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { RedisService } from '../redis/redis.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.setTimeout(20000);

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

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
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(mockRedisService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('/admin/users (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .expect(200);
    expect(response.body).toBeDefined();
  });

  it('/admin/promote (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/promote')
      .send({ superUserId: '1', userId: '2' })
      .expect(201);

    expect(response.body).toBeDefined();
  });
});
