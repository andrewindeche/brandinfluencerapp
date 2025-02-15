import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CampaignsModule } from 'src/campaigns/campaigns.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule,CampaignsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
