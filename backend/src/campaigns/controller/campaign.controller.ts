import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SessionAuthGuard } from '../../session-auth/session-auth.guard';

@Controller('campaign')
@UseGuards(JwtAuthGuard,SessionAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignsService) {}

  @UseGuards(JwtAuthGuard,SessionAuthGuard)
  @Post()
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Req() req: any,
  ) {
    const user = req.user;

    if (user.role !== 'brand') {
      throw new UnauthorizedException('Only brands can create campaigns');
    }
    return this.campaignService.createCampaign(createCampaignDto);
  }

  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  @Post(':campaignId/join')
  async joinCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    try {
      if (!req.user || !req.user.sub) {
        throw new Error('User is not authenticated or missing sub');
      }

      const influencerId = req.user.sub.toString();
      if (!isValidObjectId(influencerId)) {
        throw new Error('Invalid influencer ID');
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new BadRequestException('Cannot join an inactive campaign');
      }
      const alreadyJoined = campaign.influencers.some(
        (inf: any) => inf._id?.toString() === influencerId,
      );

      if (alreadyJoined) {
        throw new BadRequestException('User has already joined the campaign');
      }
      const joinedCampaign = await this.campaignService.joinCampaign(
        campaignId,
        influencerId,
      );

      return {
        message: 'Successfully joined the campaign',
        campaign: joinedCampaign,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post(':campaignId/submissions')
  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  async addSubmission(
    @Param('campaignId') campaignId: string,
    @Body('content') content: string,
    @Req() req,
  ) {
    try {
      const influencerId = req.user.sub;

      if (!content) {
        throw new BadRequestException('Content is required');
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new BadRequestException('Cannot submit to an inactive campaign');
      }

      return this.campaignService.addSubmission(
        campaignId,
        content,
        influencerId,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  getAllCampaigns(@Req() req) {
    return this.campaignService.getCampaigns();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaignById(id);
  }

  @Get(':id/influencers')
  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  async getInfluencersByCampaign(@Param('id') campaignId: string) {
    return this.campaignService.getInfluencersByCampaign(campaignId);
  }

  @Get('influencer/:influencerId')
  @UseGuards(JwtAuthGuard,SessionAuthGuard,)
  async getCampaignsByInfluencer(@Param('influencerId') influencerId: string) {
    return this.campaignService.getCampaignsByInfluencer(influencerId);
  }
}
