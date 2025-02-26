import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/service/auth.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UserModule } from 'src/user/user.module';
import { BrandModule } from '../user/brand/brand.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, UserModule, CampaignsModule, BrandModule],
  controllers: [AdminController],
  providers: [AdminService, AuthService],
})
export class AdminModule {}
