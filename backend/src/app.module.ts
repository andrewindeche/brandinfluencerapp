import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/service/auth.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from './campaigns/campaigns.module.js';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/jwt.strategy';
import * as crypto from 'crypto';

const secretKey = crypto.randomBytes(64).toString('hex');

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest_campaigns'),
    CampaignsModule,
    AuthModule,
    AdminModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: secretKey,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
