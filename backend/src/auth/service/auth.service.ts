import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Influencer } from '../schema/influencer.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Influencer') private influencerModel: Model<Influencer>,
    private jwtService: JwtService,
  ) {}

  async login(influencer: Influencer) {
    const payload = { username: influencer.username, sub: influencer.id };
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
