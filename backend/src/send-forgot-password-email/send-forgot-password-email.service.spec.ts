import { Test, TestingModule } from '@nestjs/testing';
import { SendForgotPasswordEmailService } from './send-forgot-password-email.service';

describe('SendForgotPasswordEmailService', () => {
  let service: SendForgotPasswordEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendForgotPasswordEmailService],
    }).compile();

    service = module.get<SendForgotPasswordEmailService>(
      SendForgotPasswordEmailService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
