import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Influencer } from '../schema/influencer.schema';
import { Brand } from '../../user/brand/schema/brand.schema';
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

  async validateUser(
    username: string,
    pass: string,
    userType: 'influencer' | 'brand',
  ): Promise<any> {
    let user;
    if (userType === 'influencer') {
      user = await this.influencerModel.findOne({ username });
    } else if (userType === 'brand') {
      user = await this.brandModel.findOne({ username });
    }

    if (!user) {
      console.log('User not found');
      return null;
  }

    const isMatch = await bcrypt.compare(pass, user.password);
    console.log(`Password comparison result: ${isMatch}`);
    
    if (isMatch) {
        return user;
    }
    return null;
  }
  async registerInfluencer(username: string, email: string, password: string): Promise<Influencer> {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Registering influencer with hashed password: ${hashedPassword}`);
    const newInfluencer = new this.influencerModel({
        username,
        email,
        password: hashedPassword,
    });
    return newInfluencer.save();
}

  async registerBrand(
    username: string,
    email: string,
    password: string,
  ): Promise<Brand> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newBrand = new this.brandModel({
      username,
      email,
      password: hashedPassword,
    });
    return newBrand.save();
  }

  async findallinfluencers(): Promise<Influencer[]> {
    return this.influencerModel.find().exec();
  }

  async findAllBrands(): Promise<Brand[]> {
    return this.brandModel.find().exec();
  }
}
