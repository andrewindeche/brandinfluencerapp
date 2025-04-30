import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model, Types } from 'mongoose';
import { Campaign } from '../schemas/campaign.schema';
import { Submission } from '../../auth/schema/submission.schema';
import { BadRequestException } from '@nestjs/common';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let campaignModel: jest.Mocked<Model<Campaign>>;
  let submissionModel: jest.Mocked<Model<Submission>>;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getModelToken(Campaign.name),
          useValue: Object.assign(
            jest.fn().mockImplementation((data) => ({
              ...data,
              save: jest.fn().mockResolvedValue({ _id: 'mockId', ...data }),
            })),
            {
              findById: jest.fn(),
              find: jest.fn(),
              create: jest.fn(),
              exec: jest.fn(),
              populate: jest.fn(),
            },
          ),
        },
        {
          provide: getModelToken(Submission.name),
          useValue: Object.assign(
            jest.fn().mockImplementation((data) => ({
              ...data,
              _id: new Types.ObjectId(), // ensure _id is a valid ObjectId
              save: jest
                .fn()
                .mockResolvedValue({ _id: new Types.ObjectId(), ...data }),
            })),
            {
              create: jest.fn(),
            },
          ),
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    campaignModel = module.get(getModelToken(Campaign.name));
    submissionModel = module.get(getModelToken(Submission.name));
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('createCampaign', () => {
    it('should throw if dates are in the past', async () => {
      await expect(() =>
        service.createCampaign({
          title: 'Old Campaign',
          description: 'Test',
          startDate: '2000-01-01',
          endDate: '2001-01-01',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if endDate is before startDate', async () => {
      const future = new Date(Date.now() + 100000);
      const now = new Date();

      await expect(() =>
        service.createCampaign({
          title: 'Invalid',
          description: 'Test',
          startDate: future.toISOString(),
          endDate: now.toISOString(),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create campaign with default status active', async () => {
      const startDate = new Date(Date.now() + 100000).toISOString();
      const endDate = new Date(Date.now() + 200000).toISOString();

      const mockCampaignData = {
        title: 'New Campaign',
        description: 'Details',
        startDate,
        endDate,
        status: 'active',
      };

      const mockSave = jest
        .fn()
        .mockResolvedValue({ _id: 'mockId', ...mockCampaignData });
      const mockCampaignInstance = { ...mockCampaignData, save: mockSave };

      (campaignModel as any).mockImplementation(() => mockCampaignInstance);

      const result = await service.createCampaign(mockCampaignData as any);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'mockId', ...mockCampaignData });
    });
  });

  describe('addSubmission', () => {
    it('should throw if campaignId is invalid', async () => {
      await expect(
        service.addSubmission('invalidId', 'Content', '123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if influencer has not joined the campaign', async () => {
      const campaignId = new Types.ObjectId().toHexString();
      const influencerId = new Types.ObjectId().toHexString();

      const campaign = { _id: campaignId, influencers: [] };
      campaignModel.findById = jest.fn().mockResolvedValue(campaign);

      await expect(
        service.addSubmission(campaignId, 'Submission content', influencerId),
      ).rejects.toThrow('Influencer has not joined the campaign');
    });

    it('should add a submission successfully if campaign and influencer are valid', async () => {
      const campaignId = new Types.ObjectId().toHexString();
      const influencerId = new Types.ObjectId().toHexString();

      const campaign = {
        _id: campaignId,
        influencers: [influencerId],
        submissions: [],
        save: jest.fn(),
      };
      campaignModel.findById = jest.fn().mockResolvedValue(campaign);

      const submission = {
        _id: 'submission123',
        content: 'Submission content',
      };
      submissionModel.create = jest.fn().mockResolvedValue(submission);

      const result = await service.addSubmission(
        campaignId,
        'Submission content',
        influencerId,
      );
      expect(result).toEqual({
        id: expect.any(String),
        content: 'Submission content',
      });
    });
  });

  describe('getCampaigns', () => {
    it('should return cached campaigns if available', async () => {
      const mockCampaigns = [{ title: 'Cached Campaign' }];
      cacheManager.get.mockResolvedValue(mockCampaigns);

      const result = await service.getCampaigns();
      expect(result).toBe(mockCampaigns);
    });
  });

  describe('updateCampaignStatus', () => {
    it('should activate or deactivate campaign based on dates', async () => {
      const now = new Date();
      const campaignMock = {
        startDate: new Date(now.getTime() - 5000),
        endDate: new Date(now.getTime() + 5000),
        status: 'inactive',
        save: jest.fn().mockResolvedValue(true),
      };
      campaignModel.findById = jest.fn().mockResolvedValue(campaignMock as any);

      await service.updateCampaignStatus(new Types.ObjectId().toHexString());
      expect(campaignMock.status).toBe('active');
    });
  });
});
