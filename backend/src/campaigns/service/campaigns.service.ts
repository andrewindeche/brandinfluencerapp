import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types, Schema } from 'mongoose';
import { Campaign } from '../schemas/campaign.schema';
import { Submission } from '../../auth/schema/submission.schema';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
  ) {}

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    const currentDate = new Date();
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);

    let status: 'active' | 'inactive' = createCampaignDto.status || 'active';

    if (!createCampaignDto.status) {
      if (currentDate >= startDate && currentDate <= endDate) {
        status = 'active';
      }
    }

    const createdCampaign = new this.campaignModel({
      ...createCampaignDto,
      status,
    });
    return createdCampaign.save();
  }

  async addSubmission(
    campaignId: string,
    content: string,
    influencerId: string,
    fileUrl: string,
  ): Promise<Submission> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    const influencerObjectId = new Types.ObjectId(influencerId);
    if (
      !campaign.influencers.some(
        (influencer) => influencer.toString() === influencerObjectId.toString(),
      )
    ) {
      throw new Error('Influencer has not joined the campaign');
    }

    const submission = new this.submissionModel({
      campaign: campaign._id,
      influencer: influencerObjectId,
      content,
      fileUrl,
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

    if (
      currentDate >= startDate &&
      currentDate <= endDate &&
      campaign.status !== 'active'
    ) {
      campaign.status = 'active';
    } else if (
      currentDate < startDate ||
      (currentDate > endDate && campaign.status !== 'inactive')
    ) {
      campaign.status = 'inactive';
    }

    return campaign.save();
  }

  async getInfluencersByCampaign(campaignId: string): Promise<any[]> {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate({
        path: 'influencers',
        select: 'username email',
      })
      .populate({
        path: 'submissions',
        select: 'influencer submittedAt postCount',
      })
      .exec();

    if (!campaign) {
      throw new Error('Campaign not found');
    }
    const influencers = campaign.submissions.map((submission: any) => {
      const influencer = campaign.influencers.find(
        (influencer: any) =>
          influencer._id.toString() === submission.influencer.toString(),
      );
      return {
        influencer,
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

  async joinCampaign(
    campaignId: string,
    influencerId: string,
  ): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    if (!campaign.influencers) {
      campaign.influencers = [];
    }

    const influencerObjectId = new Types.ObjectId(influencerId);

    const influencerExists = campaign.influencers.some(
      (id) => id.toString() === influencerObjectId.toString(),
    );
    if (!influencerExists) {
      campaign.influencers.push(influencerObjectId as any);
      await campaign.save();
    }
    return campaign;
  }

  async getCampaignsByInfluencer(influencerId: string): Promise<Campaign[]> {
    return this.campaignModel.find({ influencers: influencerId }).exec();
  }
  async getInfluencersWithSubmissions(campaignId: string) {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('influencers', 'username email')
      .populate({
        path: 'influencers',
        select: 'username',
        populate: {
          path: 'submissions',
          select: 'content fileUrl submittedAt',
          match: { campaign: campaignId },
        },
      })
      .exec();

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return campaign.influencers.map((influencer: any) => ({
      influencer,
      submissions: influencer.submissions || [],
    }));
  }
}
