import { Controller, Post, Body, Get, Param, UploadedFiles, UseInterceptors  } from '@nestjs/common';
import { CampaignsService } from '../service/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

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
  
    @Post(':campaignId/submissions')
    @UseInterceptors(FileInterceptor('file'))
    async addSubmission(
      @Param('campaignId') campaignId: string,
      @UploadedFiles() file: Express.Multer.File,
    ) {
      const fileUrl = file.filename;
      return this.campaignService.addSubmission(campaignId, fileUrl);
    }
  
    @Get()
    getAllCampaigns() {
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
}
