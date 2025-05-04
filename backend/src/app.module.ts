import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { MetricsModule } from './test-metrics/test-metrics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/service/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { RedisService } from './redis/redis.service';
import { SessionService } from './session/session.service';
import { SendForgotPasswordEmailService } from './send-forgot-password-email/send-forgot-password-email.service';
import { ForgotPasswordService } from './forgot-password/forgot-password.service';
import { RedisModule } from './redis/redis.module';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.local' : '.env',
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      useFactory: async () => {
        const jwtSecretPath = path.resolve(__dirname, '..', '.jwt_secret');
        console.log('Resolved JWT secret file path:', jwtSecretPath); 
        console.log('Current working directory:', process.cwd());
        
        if (!fs.existsSync(jwtSecretPath)) {
          console.error('JWT secret file not found at:', jwtSecretPath);
          throw new Error('JWT secret file missing');
        }

        const jwtSecret = fs.readFileSync(jwtSecretPath, 'utf-8').trim();

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '60s' },
        };
      },
    }),

    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
      inject: [ConfigService],
    }),

    CampaignsModule,
    AuthModule,
    AdminModule,
    UserModule,
    PassportModule,
    MetricsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
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
