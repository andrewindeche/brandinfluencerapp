import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    await this.createSuperUser();
  }

  async createSuperUser() {
    const superUserExists = await this.userModel.findOne({ role: 'admin' }).exec();

    if (!superUserExists) {
      const hashedPassword = await bcrypt.hash('superpassword', 10); 
      const superUser = new this.userModel({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      await superUser.save();
      console.log('Superuser created: superadmin');
    } else {
      console.log('Superuser already exists.');
    }
  }

  async createAdmin(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    return adminUser.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
