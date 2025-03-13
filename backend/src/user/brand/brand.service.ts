import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/user.schema';
import * as bcryptjs from 'bcryptjs';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import { CreateUserDto } from '../../auth/dto/create-user.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Campaign') private campaignModel: Model<Campaign>,
  ) {}

  async createBrand(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newBrand = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'brand',
    });

    return newBrand.save();
  }

  async login(username: string, password: string, role: string): Promise<any> {
    const user = await this.userModel.findOne({ username, role });
    if (user && (await bcryptjs.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async viewCampaigns(brandId: string): Promise<Campaign[]> {
    return this.campaignModel.find({ brandId }).exec();
  }

  async viewStats(brandId: string): Promise<any> {
    const campaigns = await this.campaignModel.find({ brandId }).exec();
    return {
      totalCampaigns: campaigns.length,
    };
  }
}
