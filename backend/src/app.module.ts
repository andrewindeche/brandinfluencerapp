import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/service/auth.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { SendForgotPasswordEmailService } from './send-forgot-password-email/send-forgot-password-email.service';
import { RedisService } from './redis/redis.service';
import { SessionService } from './session/session.service';
import { ForgotPasswordService } from './forgot-password/forgot-password.service';
import * as fs from 'fs';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { MetricsModule } from './test-metrics/test-metrics.module';

function loadJwtSecret() {
  try {
    const secret = fs.readFileSync('.jwt_secret').toString().trim();
    process.env.JWT_SECRET = secret;
    return secret;
  } catch (error) {
    throw new Error(
      'JWT secret not found, ensure the .jwt_secret file is present.',
    );
  }
}

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/nest_campaigns'),
    CampaignsModule,
    AuthModule,
    AdminModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: loadJwtSecret(),
      signOptions: { expiresIn: '60s' },
    }),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6380,
    }),
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    JwtStrategy,
    RedisService,
    SessionService,
    SendForgotPasswordEmailService,
    ForgotPasswordService,
  ],
})
export class AppModule {}
