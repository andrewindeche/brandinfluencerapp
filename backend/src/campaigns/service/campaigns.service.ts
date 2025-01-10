import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from '../schemas/campaign.schema';
import { Submission } from '../schemas/submission.schema';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
    constructor(
        @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
        @InjectModel(Submission.name) private submissionModel: Model<Submission>,
      ) {}
    
      async createCampaign(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
        const currentDate = new Date();
        const startDate = new Date(createCampaignDto.startDate);
        const endDate = new Date(createCampaignDto.endDate);
        let status: 'active' | 'inactive';

        if (currentDate >= startDate && currentDate <= endDate) {
          status = 'active';
        } else {
          status = 'inactive';
        }

        const createdCampaign = new this.campaignModel({
          ...createCampaignDto,
          status,
        });
        return createdCampaign.save();
}
  async addSubmission(campaignId: string, content: string): Promise<Submission> {
      const campaign = await this.campaignModel.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const submission = new this.submissionModel({
        campaign: campaign._id,
        content,
        submittedAt: new Date(),
      });

      await submission.save();
      campaign.submissions.push(submission._id as string);
      await campaign.save();

      return submission;
    }

    async updateCampaignStatus(campaignId: string): Promise<Campaign> {
      const campaign = await this.campaignModel.findById(campaignId);

      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);
      const currentDate = new Date();
    
      if (currentDate >= startDate && currentDate <= endDate) {
        campaign.status = 'active';
      } else {
        campaign.status = 'inactive';
      }
  
      return campaign.save();
    }

  async getInfluencersByCampaign(campaignId: string): Promise<any> {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('submissions')
      .exec();
  
    if (!campaign) {
      throw new Error('Campaign not found');
    }
  
    const influencers = campaign.submissions.map((submission: any) => {
      return {
        influencer: submission.influencer, 
        submissionDate: submission.submittedAt, 
        postCount: submission.postCount, 
      };
    });
  
    return influencers;
  }
  
  async getCampaigns(): Promise<Campaign[]> {
    return this.campaignModel.find().populate('submissions').exec();
  }

  async getCampaignById(id: string): Promise<Campaign> {
    return this.campaignModel.findById(id).populate('submissions').exec();
  }
}