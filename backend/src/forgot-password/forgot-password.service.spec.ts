import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordService } from './forgot-password.service';
import { RedisService } from '../redis/redis.service';
import { SendForgotPasswordEmailService } from '../send-forgot-password-email/send-forgot-password-email.service';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let redisService: { setToken: jest.Mock; getToken: jest.Mock; deleteToken: jest.Mock };
  let mailService: { sendEmail: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordService,
        {
          provide: RedisService,
          useValue: {
            setToken: jest.fn(),
            getToken: jest.fn(),
            deleteToken: jest.fn(),
          },
        },
        {
          provide: SendForgotPasswordEmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ForgotPasswordService>(ForgotPasswordService);
    redisService = module.get(RedisService);
    mailService = module.get(SendForgotPasswordEmailService);
  });

  describe('sendResetEmail', () => {
    it('should generate a reset token, store it in Redis, and send an email', async () => {
      const email = 'test@example.com';
      const token = uuidv4();
      const previewLink = 'http://localhost:3000/forgotpassword?token=' + token;

      redisService.setToken.mockResolvedValue(true);
      mailService.sendEmail.mockResolvedValue(previewLink);

      const result = await service.sendResetEmail(email);

      expect(redisService.setToken).toHaveBeenCalledWith(`forgot-password:${token}`, email, 15 * 60);
      expect(mailService.sendEmail).toHaveBeenCalledWith(email, `http://localhost:3000/forgotpassword?token=${token}`);
      expect(result).toBe(previewLink);
    });
  });

  describe('validateToken', () => {
    it('should return the email if the token is valid', async () => {
      const token = uuidv4();
      const email = 'test@example.com';
      redisService.getToken.mockResolvedValue(email);
  
      const result = await service.validateToken(token);
  
      expect(redisService.getToken).toHaveBeenCalledWith(`forgot-password:${token}`);
      expect(result).toBe(email);
    });
  
    it('should throw a NotFoundException if the token is invalid or expired', async () => {
      const token = uuidv4();
      redisService.getToken.mockResolvedValue(null);
  
      await expect(service.validateToken(token)).rejects.toThrow(
        new NotFoundException('Token invalid or expired'),
      );
    });
  });  

  describe('invalidateToken', () => {
    it('should delete the token from Redis', async () => {
      const token = uuidv4();
      await service.invalidateToken(token);

      expect(redisService.deleteToken).toHaveBeenCalledWith(`forgot-password:${token}`);
    });
  });
});
