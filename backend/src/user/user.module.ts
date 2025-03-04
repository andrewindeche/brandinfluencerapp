import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { Influencer, InfluencerSchema } from '../user/influencer/influencer.schema';
import { Brand, BrandSchema } from '../user/brand/schema/brand.schema'; 

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'Influencer', schema: InfluencerSchema },
    { name: 'Brand', schema: BrandSchema },
  ])
],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
