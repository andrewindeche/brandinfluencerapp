import { forwardRef, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { InfluencerSchema } from '../user/influencer/influencer.schema';
import { BrandModule } from '../user/brand/brand.module';
import { UserModule } from '../user/user.module';
import { ForgotPasswordService } from '../forgot-password/forgot-password.service';
import { SessionService } from '../session/session.service';
import { RedisService } from '../redis/redis.service';
import { SendForgotPasswordEmailService } from '../send-forgot-password-email/send-forgot-password-email.service';
import { RedisModule } from '../redis/redis.module';

const jwtSecret =
  process.env.JWT_SECRET ||
  (fs.existsSync('.jwt_secret')
    ? fs.readFileSync('.jwt_secret', 'utf8')
    : (() => {
        const newSecret = crypto.randomBytes(64).toString('hex');
        fs.writeFileSync('.jwt_secret', newSecret);
        return newSecret;
      })());

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Influencer', schema: InfluencerSchema },
    ]),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtSecret,
      signOptions: { expiresIn: '60m' },
    }),
    BrandModule,
    RedisModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ForgotPasswordService,
    RedisService,
    SendForgotPasswordEmailService,
    SessionService,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtStrategy,
    JwtModule,
    BrandModule,
    PassportModule,
    SessionService,
  ],
})
export class AuthModule {}
