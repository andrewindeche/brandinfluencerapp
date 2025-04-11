import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs'; 
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') 
  private userModel: Model<User>,
  private readonly redisService: RedisService, 
  ) {}

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

  async updatePassword(userId: string, newRawPassword: string): Promise<void> {
    const rateLimitKey = `password_reset_rate_limit:${userId}`;
    const ttl = 3600;

    await this.redisService.rateLimitOrThrow(
      rateLimitKey,
      ttl,
      'Password can only be changed once per hour'
    );
    try {
      const user = await this.userModel.findById(userId).select('password');
  
      if (!user) {
        throw new Error('User not found');
      }
  
      const isSamePassword = await bcrypt.compare(newRawPassword, user.password);
      if (isSamePassword) {
        throw new Error('New password cannot be the same as the old password');
      }
  
      const hashedPassword = await bcrypt.hash(newRawPassword, 10);
  
      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
      });
    } catch (error) {
      throw new Error('Error updating password: ' + error.message);
    }
  }
}
