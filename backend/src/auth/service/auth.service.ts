import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Influencer } from '../schema/influencer.schema';
import { Brand } from '../schema/brand.schema';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Influencer') private influencerModel: Model<Influencer>,
    @InjectModel('Brand') private brandModel: Model<Brand>,
    private jwtService: JwtService,
    private userService: UserService,
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

  async loginBrand(brand: Brand) {
    const payload = { username: brand.username, sub: brand.id, type: 'brand' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const influencer = await this.influencerModel.findOne({ username });
    if (influencer && (await bcrypt.compare(pass, influencer.password))) {
      return influencer;
    }
    return null;
  }

  async findallinfluencers(): Promise<Influencer[]> {
    return this.influencerModel.find().exec();
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<Influencer> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newInfluencer = new this.influencerModel({
      username,
      email,
      password: hashedPassword,
    });
    return newInfluencer.save();
  }
}
