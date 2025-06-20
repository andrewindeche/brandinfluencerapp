import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly userService: UserService,
  ) {}

  async bootstrapSuperUserFromEnv(): Promise<void> {
    const exists = await this.userModel.exists({ role: 'superuser' });
    if (exists) return;

    const username = process.env.SUPERUSER_USERNAME;
    const email = process.env.SUPERUSER_EMAIL;
    const password = process.env.SUPERUSER_PASSWORD;

    if (!username || !email || !password) {
      throw new Error('Superuser ENV vars missing');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      role: 'superuser',
    });
  }

  async promoteUserToAdmin(superUserId: string, userId: string): Promise<User> {
    const superUser = await this.userModel.findById(superUserId).exec();
    if (!superUser || superUser.role !== 'superuser') {
      throw new ForbiddenException(
        'Only the superuser can promote others to admin.',
      );
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found.');
    }

    user.role = 'admin';
    return user.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
