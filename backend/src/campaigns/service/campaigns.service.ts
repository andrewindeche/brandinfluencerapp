import { Injectable, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Campaign } from '../schemas/campaign.schema';
import { Submission } from '../../auth/schema/submission.schema';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
  ) {}

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    const currentDate = new Date();
    const startDate = new Date(createCampaignDto.startDate);
    const endDate = new Date(createCampaignDto.endDate);

    if (startDate < currentDate || endDate < currentDate) {
      throw new BadRequestException(
        'Start date and end date must be in the future.',
      );
    }

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date.');
    }

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
  ): Promise<Submission> {
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('Invalid campaignId');
    }
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
      submittedAt: new Date(),
    });
    await submission.save();

    const submissionId = submission._id.toString();
    campaign.submissions.push(submissionId);
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
    const campaigns = await this.campaignModel
      .find()
      .populate('influencers', 'username email');
    return campaigns;
  }

  async getCampaignById(campaignId: string): Promise<Campaign> {
    return this.campaignModel
      .findById(campaignId)
      .populate('influencers', 'username email')
      .exec();
  }

  async joinCampaign(
    campaignId: string,
    influencerId: string,
  ): Promise<Campaign> {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('influencers', 'username');
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'inactive') {
      throw new BadRequestException('Cannot join an inactive campaign');
    }

    if (!campaign.influencers) {
      campaign.influencers = [];
    }

    const influencerObjectId = new Types.ObjectId(influencerId);

    const influencerExists = campaign.influencers.some((influencer: any) =>
      influencer._id
        ? influencer._id.toString() === influencerObjectId.toString()
        : influencer.toString() === influencerObjectId.toString(),
    );
    if (!influencerExists) {
      campaign.influencers.push(influencerObjectId as any);
      await campaign.save();
    }
    return campaign.populate('influencers', 'username');
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
