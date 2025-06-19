import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
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

  async findById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
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
      'Password can only be changed once per hour',
    );
    try {
      const user = await this.userModel.findById(userId).select('password');

      if (!user) {
        throw new Error('User not found');
      }

      const isSamePassword = await bcrypt.compare(
        newRawPassword,
        user.password,
      );
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

  async updateProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const imageUrl = `uploads/${file.originalname}`;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async updateBio(userId: string, bio: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { bio },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
