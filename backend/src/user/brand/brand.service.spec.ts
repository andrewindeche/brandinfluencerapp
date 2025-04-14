import { BrandService } from './brand.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/user.schema';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import * as bcryptjs from 'bcryptjs';

describe('BrandService', () => {
  let service: BrandService;
  let userModel: jest.Mocked<Model<User>>;
  let campaignModel: jest.Mocked<Model<Campaign>>;

  beforeEach(() => {
    userModel = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;

    campaignModel = {
      find: jest.fn(),
    } as any;

    service = new BrandService(userModel, campaignModel);
  });

  describe('createBrand', () => {
    it('should throw if user with email or username exists', async () => {
      userModel.findOne.mockResolvedValue({});

      await expect(
        service.createBrand({
          username: 'testuser',
          email: 'test@example.com',
          password: 'pass123',
          confirmPassword: 'pass123',
          role: 'brand',
        }),
      ).rejects.toThrow('Username or email already exists');
    });

    it('should hash password and create brand', async () => {
      userModel.findOne.mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
        role: 'brand',
      });

      userModel.constructor = jest.fn().mockImplementation((data) => ({
        ...data,
        save: saveMock,
      }));

      const serviceWithConstructor = new BrandService(
        userModel.constructor as any,
        campaignModel,
      );

      const result = await serviceWithConstructor.createBrand({
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123',
        confirmPassword: 'pass123',
        role: 'brand',
      });

      expect(result).toHaveProperty('role', 'brand');
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user if credentials are correct', async () => {
      const user = {
        username: 'testuser',
        password: await bcryptjs.hash('pass123', 10),
        role: 'brand',
      };

      userModel.findOne.mockResolvedValue(user as any);

      const result = await service.login('testuser', 'pass123', 'brand');
      expect(result).toEqual(user);
    });

    it('should return null if credentials are incorrect', async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await service.login('testuser', 'wrongpass', 'brand');
      expect(result).toBeNull();
    });
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
