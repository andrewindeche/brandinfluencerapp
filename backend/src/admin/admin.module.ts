import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/service/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UserModule } from '../user/user.module';
import { BrandModule } from '../user/brand/brand.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { BrandService } from '../user/brand/brand.service';
import { UserSchema } from '../user/user.schema';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CampaignsModule,
    BrandModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService, BrandService, AuthService, UserService],
})
export class AdminModule {}
