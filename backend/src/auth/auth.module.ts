import { forwardRef, Module } from '@nestjs/common';
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


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Influencer', schema: InfluencerSchema },
    ]),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
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
