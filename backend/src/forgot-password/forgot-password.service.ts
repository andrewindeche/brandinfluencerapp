import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { SendForgotPasswordEmailService } from '../send-forgot-password-email/send-forgot-password-email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: SendForgotPasswordEmailService,
  ) {}

  async sendResetEmail(email: string) {
    const token = uuidv4();
    const key = `forgot-password:${token}`;

    await this.redisService.setToken(key, email, 15 * 60);

    const resetLink = `http://localhost:3000/forgotpassword?token=${token}`;
    const previewLink = await this.mailService.sendEmail(email, resetLink);

    return previewLink;
  }

  async validateToken(token: string): Promise<string> {
    const key = `forgot-password:${token}`;
    const email = await this.redisService.getToken(key);
    if (!email) throw new NotFoundException('Token invalid or expired');
    return email;
  }

  async invalidateToken(token: string) {
    await this.redisService.deleteToken(`forgot-password:${token}`);
  }
}
