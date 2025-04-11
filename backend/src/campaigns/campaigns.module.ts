import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CampaignsService } from './service/campaigns.service';
import { SessionService } from '../session/session.service';
import { RedisService } from '../redis/redis.service';
import { CampaignController } from './controller/campaign.controller';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { Submission, SubmissionSchema } from '../auth/schema/submission.schema';
import { InfluencerSchema } from '../user/influencer/influencer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: 'Influencer', schema: InfluencerSchema },
    ]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6380,
    }),
  ],
  providers: [CampaignsService, SessionService, RedisService],
  controllers: [CampaignController],
  exports: [MongooseModule, CampaignsService, SessionService, RedisService],
})
export class CampaignsModule {}
