import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('influencer/login')
  async loginInfluencer(@Body() loginDto: LoginUserDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
        'influencer',
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.loginInfluencer(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException('An error occurred during login.');
    }
  }

  @Post('brand/login')
  async loginBrand(@Body() loginDto: LoginUserDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
        'brand',
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.loginBrand(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException('An error occurred during login.');
    }
  }

  @Post('influencer/register')
  async registerInfluencer(@Body() registerDto: CreateUserDto) {
    try {
      const newInfluencer = await this.authService.registerInfluencer(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
      return newInfluencer;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email or username already exists.');
      }
      throw new InternalServerErrorException('An error occurred during registration.');
    }
  }

  @Post('brand/register')
  async registerBrand(@Body() registerDto: CreateUserDto) {
    try {
      const newBrand = await this.authService.registerBrand(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
      return newBrand;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email or username already exists.');
      }
      throw new InternalServerErrorException('An error occurred during registration.');
    }
  }
}
