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

  async createSuperUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const superUserExists = await this.userModel
      .findOne({ role: 'superuser' })
      .exec();

    if (!superUserExists) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const superUser = await this.userModel.create({
        username,
        email,
        password: hashedPassword,
        role: 'superuser',
      });

      await superUser.save();
      return superUser;
    } else {
      throw new Error('Superuser already exists.');
    }
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
