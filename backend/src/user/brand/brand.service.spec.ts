import { BrandService } from './brand.service';
import { Model } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';

describe('BrandService', () => {
  let service: BrandService;
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let campaignModel: jest.Mocked<Model<Campaign>>;

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn();
    campaignModel = {
      find: jest.fn(),
    } as any;

    service = new BrandService(campaignModel);
  });

  describe('viewCampaigns', () => {
    it('should return campaigns for brand', async () => {
      const mockCampaigns = [{ title: 'Campaign 1' }, { title: 'Campaign 2' }];
      campaignModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCampaigns),
      } as any);

      const result = await service.viewCampaigns('brandId123');
      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('viewStats', () => {
    it('should return campaign stats', async () => {
      const campaigns = [{}, {}, {}];
      campaignModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(campaigns),
      } as any);

      const stats = await service.viewStats('brandId123');
      expect(stats).toEqual({ totalCampaigns: 3 });
    });
  });
});
