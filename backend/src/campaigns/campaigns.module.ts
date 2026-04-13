import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CampaignsService } from './service/campaigns.service';
import { SessionService } from '../session/session.service';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';
import { CampaignController } from './controller/campaign.controller';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { SubmissionSchema } from './schemas/submission.schema';
import { InfluencerSchema } from '../user/influencer/influencer.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: 'Submission', schema: SubmissionSchema },
      { name: 'Influencer', schema: InfluencerSchema },
      { name: 'User', schema: UserSchema },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    KafkaModule,
  ],
  providers: [CampaignsService, SessionService, RedisService],
  controllers: [CampaignController],
  exports: [
    MongooseModule,
    CampaignsService,
    SessionService,
    RedisService,
    KafkaModule,
  ],
})
export class CampaignsModule {}
