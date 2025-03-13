import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  async createUser(userData: User): Promise<User> {
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('Email or username already exists.');
    }

    try {
      const user = new this.userModel(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
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
