import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AdminController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
