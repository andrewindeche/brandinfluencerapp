import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schema/brand.schema';
import * as bcryptjs from 'bcryptjs';
import { Campaign } from '../../campaigns/schemas/campaign.schema';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('Brand') private brandModel: Model<Brand>,
    @InjectModel('Campaign') private campaignModel: Model<Campaign>,
  ) {}

  async login(username: string, password: string): Promise<any> {
    const brand = await this.brandModel.findOne({ username });
    if (brand && (await bcryptjs.compare(password, brand.password))) {
      return brand;
    }
    return null;
  }

  async viewCampaigns(brandId: string): Promise<Campaign[]> {
    return this.campaignModel.find({ brandId }).exec();
  }

  async viewStats(brandId: string): Promise<any> {
    const campaigns = await this.campaignModel.find({ brandId }).exec();
    return {
      totalCampaigns: campaigns.length,
    };
  }
}

