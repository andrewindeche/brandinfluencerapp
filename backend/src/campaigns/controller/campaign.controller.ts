import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UnauthorizedException,
  BadRequestException,
  Req,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SessionAuthGuard } from '../../session-auth/session-auth.guard';

@Controller('campaign')
@UseGuards(JwtAuthGuard, SessionAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignsService) {}

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

  @Post(':campaignId/join')
  async joinCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    try {
      if (!req.user || !req.user.sub) {
        throw new BadRequestException(
          'User is not authenticated or missing sub',
        );
      }

      const influencerId = req.user.sub.toString();
      if (!isValidObjectId(influencerId)) {
        throw new BadRequestException('Invalid influencer ID');
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        throw new BadRequestException('Campaign not found');
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(':campaignId/submissions')
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
        throw new BadRequestException('Campaign not found');
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  getAllCampaigns(@Req() req) {
    return this.campaignService.getCampaigns();
  }

  @Get(':id')
  getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaignById(id);
  }

  @Get(':id/influencers')
  async getInfluencersByCampaign(@Param('id') campaignId: string) {
    return this.campaignService.getInfluencersByCampaign(campaignId);
  }

  @Get('influencer/:influencerId')
  async getCampaignsByInfluencer(@Param('influencerId') influencerId: string) {
    return this.campaignService.getCampaignsByInfluencer(influencerId);
  }
}
