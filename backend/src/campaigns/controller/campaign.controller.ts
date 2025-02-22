import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignsService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.createCampaign(createCampaignDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFiles() file: Express.Multer.File) {
    console.log(file);
  }

  @Post(':campaignId/join')
  @UseGuards(JwtAuthGuard)
  async joinCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    const influencerId = req.user.sub;

    const campaign = await this.campaignService.getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (
      !campaign.influencers.some(
        (influencer) => influencer.toString() === influencerId,
      )
    ) {
      campaign.influencers.push(influencerId);
      await campaign.save();
    }

    return campaign.populate('influencers', 'username email');
  }

  @Post(':campaignId/submissions')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async addSubmission(
    @Param('campaignId') campaignId: string,
    @UploadedFiles() file: Express.Multer.File,
    @Body('content') content: string,
    @Body('submissionData') submissionData: any,
    @Req() req,
  ) {
    const influencerId = req.user.sub;
    const fileUrl = file ? file.filename : null;
    if (!fileUrl && !content) {
      throw new BadRequestException('Either content or file must be provided');
    }
    return this.campaignService.addSubmission(
      campaignId,
      content,
      influencerId,
      submissionData,
    );
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  getAllCampaigns() {
    return this.campaignService.getCampaigns();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaignById(id);
  }

  @Get(':id/influencers')
  @UseGuards(JwtAuthGuard)
  async getInfluencersByCampaign(@Param('id') campaignId: string) {
    return this.campaignService.getInfluencersByCampaign(campaignId);
  }

  @Get('influencer/:influencerId')
  @UseGuards(JwtAuthGuard)
  async getCampaignsByInfluencer(@Param('influencerId') influencerId: string) {
    return this.campaignService.getCampaignsByInfluencer(influencerId);
  }
}
