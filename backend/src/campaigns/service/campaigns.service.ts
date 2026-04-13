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
import { Submission, SubmissionDocument } from '../../interfaces';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from 'src/redis/redis.service';
import { KafkaService } from 'src/kafka/kafka.service';
import { User } from '../../user/user.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
    @InjectModel('Submission')
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
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
    const sessionKey = `joinCampaignSession:${influencerId}:${campaignId}`;
    await this.redisService.decrementCounter(sessionKey);

    const influencerObjectId = new Types.ObjectId(influencerId);
    const result = await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { $pull: { influencers: influencerObjectId } },
      { returnDocument: 'after' },
    );

    await this.cacheManager.del(`campaign_${campaignId}`);
    return result;
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

    const campaign = await this.campaignModel.findById(campaignId).exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const submissions = await this.submissionModel
      .find({ campaign: new Types.ObjectId(campaignId) })
      .populate('influencer')
      .sort({ submittedAt: -1 })
      .exec();
    await this.cacheManager.set(cacheKey, submissions, 300);
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

    campaign.submissions.push(new Types.ObjectId(submission._id));
    await campaign.save();

    const influencer = await this.userModel.findById(influencerId).lean();

    await this.kafkaService.sendMessage(
      'submission-events',
      'submission.created',
      {
        submissionId: submission._id.toString(),
        campaignId,
        influencerId,
        influencerName: influencer?.username || 'Unknown Influencer',
        brandId: campaign.brand.toString(),
        campaignTitle: campaign.title,
        content,
        timestamp: new Date().toISOString(),
      },
    );

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
    const sessionKey = `joinCampaignSession:${influencerId}:${campaignId}`;
    const maxJoinsPerCampaign = 6;
    const sessionTtl = 30 * 60;

    await this.redisService.incrementCounterRateLimit(
      sessionKey,
      maxJoinsPerCampaign,
      sessionTtl,
    );

    const key = `joinCampaign:${campaignId}:${influencerId}`;
    const ttl = 60;
    await this.redisService.rateLimitOrThrow(
      key,
      ttl,
      `Rate limit exceeded. Try again after ${ttl} seconds.`,
    );
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
      await this.cacheManager.del(`campaign_${campaignId}`);
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

  async acceptSubmission(
    submissionId: string,
    brandId: string,
  ): Promise<SubmissionDocument> {
    const submission = await this.submissionModel
      .findById(submissionId)
      .populate('campaign')
      .populate('influencer')
      .exec();

    if (!submission) throw new NotFoundException('Submission not found');

    const campaign: any = submission.campaign;
    if (!campaign)
      throw new NotFoundException('Campaign not found on submission');

    if (campaign.brand && campaign.brand.toString() !== brandId.toString()) {
      throw new BadRequestException('Not authorized');
    }

    const updated = await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: 'accepted' },
        { returnDocument: 'after' },
      )
      .populate('campaign')
      .populate('influencer')
      .exec();

    await this.cacheManager.del(`submissions_${campaign._id || campaign}`);

    const influencerId =
      (updated as any).influencer?._id?.toString() ||
      (updated as any).influencer?.toString();

    await this.kafkaService.sendMessage(
      'submission-events',
      'submission.accepted',
      {
        submissionId,
        campaignId: campaign._id.toString(),
        brandId,
        influencerId,
        campaignTitle: campaign.title,
      },
    );

    return updated as any;
  }

  async rejectSubmission(
    submissionId: string,
    brandId: string,
  ): Promise<SubmissionDocument> {
    const submission = await this.submissionModel
      .findById(submissionId)
      .populate('campaign')
      .populate('influencer')
      .exec();
    if (!submission) throw new NotFoundException('Submission not found');

    const campaign: any = (submission as any).campaign;
    if (
      campaign &&
      campaign.brand &&
      campaign.brand.toString() !== brandId.toString()
    ) {
      throw new BadRequestException(
        'You are not authorized to reject this submission',
      );
    }

    const updated = await this.submissionModel
      .findByIdAndUpdate(
        submissionId,
        { status: 'rejected' },
        { returnDocument: 'after' },
      )
      .populate('campaign')
      .populate('influencer')
      .exec();

    await this.cacheManager.del(`submissions_${campaign?._id || campaign}`);

    const influencerId =
      (updated as any).influencer?._id?.toString() ||
      (updated as any).influencer?.toString();

    await this.kafkaService.sendMessage(
      'submission-events',
      'submission.rejected',
      {
        submissionId,
        campaignId: campaign._id.toString(),
        brandId,
        influencerId,
        campaignTitle: campaign.title,
      },
    );

    return updated as any;
  }

  async updateSubmission(
    submissionId: string,
    content: string,
    influencerId: string,
  ): Promise<Submission> {
    const submission = await this.submissionModel
      .findById(submissionId)
      .populate('campaign')
      .exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const submissionInfluencerId =
      (submission as any).influencer?._id?.toString() ||
      (submission as any).influencer?.toString();

    if (submissionInfluencerId !== influencerId) {
      throw new BadRequestException('Not authorized to update this submission');
    }

    const campaignId =
      (submission as any).campaign?._id?.toString() ||
      (submission as any).campaign?.toString();

    (submission as any).content = content;
    await (submission as any).save();

    if (campaignId) {
      await this.cacheManager.del(`submissions_${campaignId}`);
    }

    return submission as any;
  }

  async deleteSubmission(
    submissionId: string,
    influencerId: string,
  ): Promise<{ success: boolean }> {
    const submission = await this.submissionModel
      .findById(submissionId)
      .populate('campaign')
      .exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const submissionInfluencerId =
      (submission as any).influencer?._id?.toString() ||
      (submission as any).influencer?.toString();

    if (submissionInfluencerId !== influencerId) {
      throw new BadRequestException('Not authorized to delete this submission');
    }

    const campaignId =
      (submission as any).campaign?._id?.toString() ||
      (submission as any).campaign?.toString();

    await this.submissionModel.deleteOne({
      _id: new Types.ObjectId(submissionId),
    });

    if (campaignId) {
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $pull: { submissions: new Types.ObjectId(submissionId) },
      });
      await this.cacheManager.del(`submissions_${campaignId}`);
    }

    return { success: true };
  }

  async inviteInfluencer(
    campaignId: string,
    influencerId: string,
  ): Promise<{ success: boolean; message: string }> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const influencer = await this.userModel.findById(influencerId);
    if (!influencer || (influencer as any).role !== 'influencer') {
      throw new BadRequestException('Invalid influencer');
    }

    const influencerStatus = (influencer as any).status;
    if (influencerStatus !== 'accepted') {
      throw new BadRequestException(
        'Influencer must be accepted by brand first',
      );
    }

    const alreadyJoined = campaign.influencers.some(
      (inf: any) =>
        inf._id?.toString() === influencerId || inf.toString() === influencerId,
    );

    if (alreadyJoined) {
      throw new BadRequestException('Influencer already in campaign');
    }

    await this.kafkaService.sendMessage('campaign-invite', 'campaign.invited', {
      campaignId,
      influencerId,
      brandId: campaign.brand?.toString(),
      campaignTitle: campaign.title,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Invitation sent to influencer' };
  }

  async acceptCampaignInvite(
    campaignId: string,
    influencerId: string,
  ): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const influencerObjectId = new Types.ObjectId(influencerId);
    const alreadyJoined = campaign.influencers.some(
      (inf: any) =>
        inf._id?.toString() === influencerId || inf.toString() === influencerId,
    );

    if (alreadyJoined) {
      throw new BadRequestException('Already joined this campaign');
    }

    campaign.influencers.push(influencerObjectId as any);
    await campaign.save();

    await this.kafkaService.sendMessage(
      'campaign-invite',
      'campaign.invite_accepted',
      {
        campaignId,
        influencerId,
        brandId: campaign.brand?.toString(),
        campaignTitle: campaign.title,
        timestamp: new Date().toISOString(),
      },
    );

    return campaign;
  }

  async rejectCampaignInvite(
    campaignId: string,
    influencerId: string,
  ): Promise<{ success: boolean }> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.kafkaService.sendMessage(
      'campaign-invite',
      'campaign.invite_rejected',
      {
        campaignId,
        influencerId,
        brandId: campaign.brand?.toString(),
        campaignTitle: campaign.title,
        timestamp: new Date().toISOString(),
      },
    );

    return { success: true };
  }
}
