import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { RedisService } from 'src/redis/redis.service';
import { InfluencerSchema } from '../user/influencer/influencer.schema';
import { BrandSchema } from '../user/brand/schema/brand.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Influencer', schema: InfluencerSchema },
      { name: 'Brand', schema: BrandSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService, MongooseModule, RedisService],
})
export class UserModule {}
