import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';
import { InfluencerSchema } from '../user/influencer/influencer.schema';
import { BrandSchema } from '../user/brand/schema/brand.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Influencer', schema: InfluencerSchema },
      { name: 'Brand', schema: BrandSchema },
    ]),
    RedisModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService, MongooseModule, RedisService],
})
export class UserModule {}
