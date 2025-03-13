import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import {
  Influencer,
  InfluencerModel,
} from '../user/influencer/influencer.schema';
import { Brand, BrandModel } from '../user/brand/schema/brand.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Influencer') private influencerModel: Model<Influencer>,
    @InjectModel('Brand') private brandModel: Model<Brand>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  async createUser(userData: User): Promise<User> {
    try {
      let user: User | PromiseLike<User>;

      if (userData.role === 'influencer') {
        user = new InfluencerModel(userData);
      } else if (userData.role === 'brand') {
        user = new BrandModel(userData);
      } else {
        throw new Error('Invalid role');
      }

      return await user.save();
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }
}
