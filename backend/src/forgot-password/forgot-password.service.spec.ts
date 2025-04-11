import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordService } from './forgot-password.service';
import { RedisService } from '../redis/redis.service';
import { SendForgotPasswordEmailService } from '../send-forgot-password-email/send-forgot-password-email.service';

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordService,
        SendForgotPasswordEmailService,
        RedisService,
      ],
    }).compile();

    service = module.get<ForgotPasswordService>(ForgotPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
