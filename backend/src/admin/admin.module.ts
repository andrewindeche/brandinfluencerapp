import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { BrandModule } from '../user/brand/brand.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, CampaignsModule, BrandModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
