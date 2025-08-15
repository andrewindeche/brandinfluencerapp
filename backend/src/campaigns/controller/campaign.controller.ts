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
  Patch,
  Delete,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SessionAuthGuard } from '../../session-auth/session-auth.guard';
import { Query } from '@nestjs/common';

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
    return this.campaignService.createCampaign({
      ...createCampaignDto,
      brand: user.userId,
    });
  }

  @Patch(':id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateCampaignDto>,
    @Req() req: any,
  ) {
    const user = req.user;
    if (user.role !== 'brand') {
      throw new UnauthorizedException('Only brands can update campaigns');
    }
    return this.campaignService.updateCampaign(id, updateDto);
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (user.role !== 'brand') {
      throw new UnauthorizedException('Only brands can delete campaigns');
    }
    return this.campaignService.deleteCampaign(id);
  }

  @Post(':campaignId/join')
  async joinCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    try {
      const user = req.user;

      const influencerId = user?.sub ?? user?.userId;

      if (!influencerId) {
        throw new BadRequestException('User is not authenticated');
      }

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
        campaign: {
          ...joinedCampaign,
          joined: true,
        },
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
      const influencerId = req.user.sub ?? req.user.userId;

      if (!content) {
        throw new BadRequestException('Content is required');
      }

      if (!isValidObjectId(influencerId)) {
        throw new BadRequestException('Invalid influencer ID');
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        throw new BadRequestException('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new BadRequestException('Cannot submit to an inactive campaign');
      }

      const hasJoined = campaign.influencers.some(
        (inf: any) => inf._id.toString() === influencerId,
      );

      if (!hasJoined) {
        throw new BadRequestException(
          'You must join this campaign before submitting content',
        );
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
  async getAllCampaigns(
    @Req() req,
    @Query('status') status: 'active' | 'inactive',
    @Query('search') search: string,
  ) {
    const user = req.user;

    if (user.role === 'influencer') {
      const influencerId = user.sub ?? user.userId;

      const campaigns = await this.campaignService.getFilteredCampaigns(
        status,
        search,
      );

      return campaigns.map((campaign) => ({
        ...campaign.toObject(),
        joined: campaign.influencers.some(
          (inf: any) => inf._id.toString() === influencerId,
        ),
      }));
    }

    if (user.role === 'brand') {
      return this.campaignService.getFilteredCampaigns(
        status,
        search,
        user.userId,
      );
    }

    throw new UnauthorizedException('Invalid user role');
  }

  @Delete(':campaignId/leave')
  async leaveCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    try {
      const user = req.user;
      const influencerId = user?.sub ?? user?.userId;

      if (!influencerId) {
        throw new BadRequestException('User is not authenticated');
      }

      if (!isValidObjectId(influencerId)) {
        throw new BadRequestException('Invalid influencer ID');
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        throw new BadRequestException('Campaign not found');
      }

      const alreadyJoined = campaign.influencers.some(
        (inf: any) => inf._id?.toString() === influencerId,
      );

      if (!alreadyJoined) {
        throw new BadRequestException('User has not joined the campaign');
      }

      const updatedCampaign = await this.campaignService.leaveCampaign(
        campaignId,
        influencerId,
      );

      return {
        message: 'Successfully left the campaign',
        campaign: {
          ...updatedCampaign,
          joined: false,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
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
