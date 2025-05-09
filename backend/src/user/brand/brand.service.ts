import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('Campaign') private campaignModel: Model<Campaign>,
  ) {}

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
