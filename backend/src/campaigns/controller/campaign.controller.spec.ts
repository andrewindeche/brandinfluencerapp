import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignsService } from '../service/campaigns.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SessionAuthGuard } from '../../session-auth/session-auth.guard';

jest.mock('../service/campaigns.service'); // Mocking the CampaignService

describe('CampaignController', () => {
  let controller: CampaignController;
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [CampaignsService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock JwtAuthGuard
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock SessionAuthGuard
      .compile();

    controller = module.get<CampaignController>(CampaignController);
    service = module.get<CampaignsService>(CampaignsService);
  });

  describe('createCampaign', () => {
    it('should throw UnauthorizedException if user is not a brand', async () => {
      const req = { user: { role: 'influencer' } };

      await expect(controller.createCampaign({ title: 'Test Campaign' }, req))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should create a campaign if the user is a brand', async () => {
      const req = { user: { role: 'brand' } };
      const createCampaignDto = { title: 'Test Campaign', startDate: '2025-01-01', endDate: '2025-12-31' };
      const createdCampaign = { ...createCampaignDto, status: 'active' };
      jest.spyOn(service, 'createCampaign').mockResolvedValue(createdCampaign);

      const result = await controller.createCampaign(createCampaignDto, req);

      expect(result).toEqual(createdCampaign);
      expect(service.createCampaign).toHaveBeenCalledWith(createCampaignDto);
    });
  });

  describe('joinCampaign', () => {
    it('should throw BadRequestException if campaign is not active', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';
      const campaign = { status: 'inactive', influencers: [] };
      jest.spyOn(service, 'getCampaignById').mockResolvedValue(campaign);

      await expect(controller.joinCampaign(campaignId, req))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if influencer already joined', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';
      const campaign = { status: 'active', influencers: [{ _id: 'influencerId' }] };
      jest.spyOn(service, 'getCampaignById').mockResolvedValue(campaign);

      await expect(controller.joinCampaign(campaignId, req))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should join the campaign successfully if conditions are met', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';
      const campaign = { status: 'active', influencers: [] };
      const joinedCampaign = { ...campaign, influencers: [{ _id: 'influencerId' }] };
      jest.spyOn(service, 'getCampaignById').mockResolvedValue(campaign);
      jest.spyOn(service, 'joinCampaign').mockResolvedValue(joinedCampaign);

      const result = await controller.joinCampaign(campaignId, req);

      expect(result.message).toBe('Successfully joined the campaign');
      expect(service.joinCampaign).toHaveBeenCalledWith(campaignId, req.user.sub);
    });
  });

  describe('addSubmission', () => {
    it('should throw BadRequestException if content is missing', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';

      await expect(controller.addSubmission(campaignId, null, req))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw Error if campaign is not found', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';
      jest.spyOn(service, 'getCampaignById').mockResolvedValue(null);

      await expect(controller.addSubmission(campaignId, 'Some content', req))
        .rejects
        .toThrow(Error);
    });

    it('should add a submission if conditions are met', async () => {
      const req = { user: { sub: 'influencerId' } };
      const campaignId = 'campaignId';
      const content = 'Some content';
      const campaign = { status: 'active' };
      const submission = { id: 'submissionId', content };

      jest.spyOn(service, 'getCampaignById').mockResolvedValue(campaign);
      jest.spyOn(service, 'addSubmission').mockResolvedValue(submission);

      const result = await controller.addSubmission(campaignId, content, req);

      expect(result).toEqual(submission);
      expect(service.addSubmission).toHaveBeenCalledWith(campaignId, content, req.user.sub);
    });
  });

  describe('getCampaigns', () => {
    it('should return a list of campaigns', async () => {
      const campaigns = [{ title: 'Test Campaign' }];
      jest.spyOn(service, 'getCampaigns').mockResolvedValue(campaigns);

      const result = await controller.getAllCampaigns({});

      expect(result).toEqual(campaigns);
      expect(service.getCampaigns).toHaveBeenCalled();
    });
  });

  describe('getCampaign', () => {
    it('should return a campaign by id', async () => {
      const campaignId = 'campaignId';
      const campaign = { title: 'Test Campaign' };
      jest.spyOn(service, 'getCampaignById').mockResolvedValue(campaign);

      const result = await controller.getCampaign(campaignId);

      expect(result).toEqual(campaign);
      expect(service.getCampaignById).toHaveBeenCalledWith(campaignId);
    });
  });

  describe('getInfluencersByCampaign', () => {
    it('should return influencers by campaign id', async () => {
      const campaignId = 'campaignId';
      const influencers = [{ username: 'influencer1' }];
      jest.spyOn(service, 'getInfluencersByCampaign').mockResolvedValue(influencers);

      const result = await controller.getInfluencersByCampaign(campaignId);

      expect(result).toEqual(influencers);
      expect(service.getInfluencersByCampaign).toHaveBeenCalledWith(campaignId);
    });
  });

  describe('getCampaignsByInfluencer', () => {
    it('should return campaigns by influencer id', async () => {
      const influencerId = 'influencerId';
      const campaigns = [{ title: 'Test Campaign' }];
      jest.spyOn(service, 'getCampaignsByInfluencer').mockResolvedValue(campaigns);

      const result = await controller.getCampaignsByInfluencer(influencerId);

      expect(result).toEqual(campaigns);
      expect(service.getCampaignsByInfluencer).toHaveBeenCalledWith(influencerId);
    });
  });
});
