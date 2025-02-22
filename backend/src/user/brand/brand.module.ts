import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandSchema } from './schema/brand.schema';
import { BrandService } from './brand.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
  ],
  providers: [BrandService],
  exports: [MongooseModule],
})
export class BrandModule {}

