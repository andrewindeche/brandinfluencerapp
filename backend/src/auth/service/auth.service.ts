import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Influencer } from '../../user/influencer/influencer.schema';
import * as bcryptjs from 'bcryptjs';
import { User } from '../../user/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async loginInfluencer(influencer: Influencer) {
    const payload = {
      username: influencer.username,
      sub: influencer.id,
      type: 'influencer',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginBrand(brand: User) {
    const payload = { username: brand.username, sub: brand._id, role: 'brand' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(
    username: string,
    password: string,
    role: string,
  ): Promise<any> {
    const user = await this.userModel.findOne({ username, role }).exec();
    if (user && (await bcryptjs.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async registerInfluencer(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, category, bio, location } =
      createUserDto;

    const existingUser = await this.userModel
      .findOne({ $or: [{ username }, { email }] })
      .exec();
    if (existingUser) {
      throw new Error('Username or email already exists.');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'influencer',
      category,
      bio,
      location,
    });

    return newUser.save();
  }

  async registerBrand(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const existingUser = await this.userModel
      .findOne({ $or: [{ username }, { email }] })
      .exec();
    if (existingUser) {
      throw new Error('Username or email already exists.');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role: 'brand',
    });

    return newUser.save();
  }
}
