import { Module } from '@nestjs/common';
import { CampaignsService } from './service/campaigns.service';
import { CampaignController } from './controller/campaign.controller';

@Module({
  providers: [CampaignsService],
  controllers: [CampaignController]
})
export class CampaignsModule {}
