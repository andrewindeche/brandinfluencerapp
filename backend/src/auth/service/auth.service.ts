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
    const fullUser = await this.userModel.findById(influencer._id).lean();
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '20m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
      user: {
        id: fullUser._id,
        username: fullUser.username,
        email: fullUser.email,
        role: fullUser.role,
        bio: fullUser.bio,
        profileImage: fullUser.profileImage,
      },
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
    const fullUser = await this.userModel.findById(brand._id).lean();
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '20m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
      user: {
        username: fullUser.username,
        role: fullUser.role,
        bio: fullUser.bio,
        profileImage: fullUser.profileImage,
      },
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<User> {
    const users = await this.userModel
      .find({ refreshToken: { $exists: true } })
      .exec();
    for (const user of users) {
      const isMatch = await bcryptjs.compare(refreshToken, user.refreshToken);
      if (isMatch) return user;
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  async validateUser(
    email: string,
    password: string,
    role: 'brand' | 'influencer' | 'admin' | 'superuser',
  ): Promise<any> {
    const user = await this.userModel.findOne({ email, role }).exec();
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

  async validateUserByIdAndRole(userId: string, role: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    return user.role?.toLowerCase() === role.toLowerCase() ? user : null;
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
      role: 'influencer',
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
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '20m',
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
    };
  }
}
