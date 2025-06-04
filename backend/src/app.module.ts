import { Module, OnModuleInit } from '@nestjs/common';
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
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env' : '.env.local',
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        bufferCommands: false,
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      useFactory: async () => {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('JWT secret is missing in the environment.');
          throw new Error('JWT secret missing');
        }

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
        password: configService.get<string>('REDIS_PASSWORD'),
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
    AppService,
    AuthService,
    JwtStrategy,
    RedisService,
    SessionService,
    SendForgotPasswordEmailService,
    ForgotPasswordService,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected');
    });
  }
}
