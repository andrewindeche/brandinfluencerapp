import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFiles,
  UseInterceptors,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('campaign')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto, @Req() req: any) {
    const user = req.user;

    if (user.role !== 'brand') {
      throw new UnauthorizedException('Only brands can create campaigns');
    }
    return this.campaignService.createCampaign(createCampaignDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFiles() file: Express.Multer.File) {
    console.log(file);
  }
  
  @UseGuards(JwtAuthGuard)
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

          const campaign = await this.campaignService.joinCampaign(campaignId, influencerId);
          return { message: 'Successfully joined the campaign', campaign };
      } catch (error) {
          return { error: error.message };
      }
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

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllCampaigns(@Req() req) {
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
