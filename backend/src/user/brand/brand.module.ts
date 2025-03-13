import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandSchema } from './schema/brand.schema';
import { BrandService } from './brand.service';
import { CampaignsModule } from '../../campaigns/campaigns.module';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
    CampaignsModule,
  ],
  providers: [BrandService],
  exports: [MongooseModule],
})
export class BrandModule {}
