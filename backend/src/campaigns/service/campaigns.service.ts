import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  async updateCampaign(
    campaignId: string,
    updateDto: Partial<CreateCampaignDto>,
  ): Promise<Campaign> {
    const existing = await this.campaignModel.findById(campaignId);
    if (!existing) throw new BadRequestException('Campaign not found');

    Object.assign(existing, updateDto);
    return existing.save();
  }

  async leaveCampaign(campaignId: string, influencerId: string) {
    return await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $pull: { influencers: influencerId } },
      { new: true },
    );
  }

  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    const result = await this.campaignModel.deleteOne({ _id: campaignId });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Campaign not found or already deleted');
    }

    await this.cacheManager.del(`campaign_${campaignId}`);
    await this.cacheManager.del('campaigns_list');

    return { success: true };
  }

  async getCampaignsByBrandId(brandId: string) {
    return this.campaignModel
      .find({ brand: new Types.ObjectId(brandId) })
      .exec();
  }

  async getFilteredCampaigns(
    status?: string,
    search?: string,
    brandId?: string,
  ) {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructions: { $regex: search, $options: 'i' } },
      ];
    }

    if (brandId) {
      filter.brand = brandId;
    }

    const query = this.campaignModel.find(filter).populate('brand');

    if (!brandId) {
      query.populate('influencers', '_id');
    }

    return query.exec();
  }

  async getSubmissionsByCampaign(campaignId: string) {
    const cacheKey = `submissions_${campaignId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('influencers', 'username email')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const submissions = await this.submissionModel
      .find({ campaign: campaignId })
      .populate('influencer', 'username email')
      .sort({ submittedAt: -1 })
      .lean();
    return submissions;
  }

  async addSubmission(
    campaignId: string,
    content: string,
    influencerId: string,
  ): Promise<{ id: string; content: string }> {
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

    campaign.submissions.push(submission._id as Types.ObjectId);
    await campaign.save();

    return { id: submission._id.toString(), content: submission.content };
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
    const cachedCampaigns =
      await this.cacheManager.get<Campaign[]>('campaigns_list');
    if (cachedCampaigns && Array.isArray(cachedCampaigns))
      return cachedCampaigns;

    const campaigns = await this.campaignModel
      .find()
      .populate('influencers', 'username email')
      .populate({
        path: 'submissions',
        select: 'content _id',
      })
      .exec();

    await this.cacheManager.set('campaigns_list', campaigns, 3600);
    return campaigns;
  }

  async getCampaignById(campaignId: string): Promise<Campaign> {
    const cachedCampaign = await this.cacheManager.get<Campaign>(
      `campaign_${campaignId}`,
    );
    if (cachedCampaign && cachedCampaign.title) return cachedCampaign;

    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('influencers', 'username email')
      .populate({
        path: 'submissions',
        select: 'content _id',
      })
      .exec();

    await this.cacheManager.set(`campaign_${campaignId}`, campaign, 3600);
    return campaign;
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

    if (campaign.status !== 'active') {
      throw new BadRequestException('Cannot join an inactive campaign');
    }

    if (!campaign.influencers) {
      campaign.influencers = [];
    }

    campaign.influencers ||= [];

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
          select: 'content submittedAt',
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
