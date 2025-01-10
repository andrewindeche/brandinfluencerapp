import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsService } from './service/campaigns.service';
import { CampaignController } from './controller/campaign.controller';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { Submission, SubmissionSchema } from './schemas/submission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  providers: [CampaignsService],
  controllers: [CampaignController]
})
export class CampaignsModule {}
