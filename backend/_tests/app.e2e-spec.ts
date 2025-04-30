import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { register } from 'prom-client';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('E2E Tests', () => {
  const testCasesTotal = register.getSingleMetric('test_cases_total');
  const testCasesFailed = register.getSingleMetric('test_cases_failed');

  beforeAll(() => {
    testCasesTotal?.inc(); // Increment total test cases
  });

  it('should return 200 OK', async () => {
    expect(true).toBe(true);
  });

  it('should fail authentication', async () => {
    try {
      expect(false).toBe(true);
    } catch (error) {
      testCasesFailed?.inc();
    }
  });
});
