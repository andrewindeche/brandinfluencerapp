import { Injectable, UnauthorizedException } from '@nestjs/common';
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
      role: 'influencer',
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '20m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcryptjs.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  async loginBrand(brand: User) {
    const payload = { username: brand.username, sub: brand._id, role: 'brand' };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '20m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.userModel.findOne({ refreshToken }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  async validateUser(
    username: string,
    password: string,
    role: 'brand' | 'influencer' | 'admin' | 'superuser',
  ): Promise<any> {
    const user = await this.userModel.findOne({ username, role }).exec();
    if (!user) {
      throw new UnauthorizedException('User not found or role mismatch');
    }
    if (password) {
      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }
    return user;
  }

  async validateUserByJwt(
    username: string,
    role: 'brand' | 'influencer' | 'admin' | 'superuser',
  ): Promise<any> {
    const user = await this.userModel.findOne({ username, role }).exec();
    if (!user) {
      throw new UnauthorizedException('User not found or role mismatch');
    }
    return user;
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

  async loginSuperuser(username: string, password: string) {
    const user = await this.validateUser(username, password, 'superuser');
        if (!user) {
          throw new UnauthorizedException();
        }
    const payload = {
      username: user.username,
      sub: user._id,
      role: 'superuser',
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '20m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
