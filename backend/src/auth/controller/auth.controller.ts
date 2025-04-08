import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ForgotPasswordService } from '../../forgot-password/forgot-password.service';
import { ForgotPasswordDto } from '../../send-forgot-password-email/dto/ForgotPasswordDto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private readonly forgotPasswordService: ForgotPasswordService,
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
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred during influencer login.',
      );
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
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred during brand login.',
      );
    }
  }

  @Post('influencer/register')
  async registerInfluencer(@Body() registerDto: CreateUserDto) {
    try {
      const newUser = await this.authService.registerInfluencer(registerDto);
      return newUser;
    } catch (error) {
      console.log('Registration error:', error);
      if (error.message === 'Email or username already exists.') {
        throw new ConflictException('Email or username already exists.');
      }
      throw new InternalServerErrorException(
        'An error occurred during registration.',
      );
    }
  }

  @Post('brand/register')
  async registerBrand(@Body() registerDto: CreateUserDto) {
    try {
      const newUser = await this.authService.registerBrand(registerDto);
      return newUser;
    } catch (error) {
      if (error.message === 'Email or username already exists.') {
        throw new ConflictException('Email or username already exists.');
      }
      throw new InternalServerErrorException(
        'An error occurred during registration.',
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const user = await this.authService.validateRefreshToken(refreshToken);

    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const payload = { username: user.username, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '20m' });

    return { access_token: newAccessToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.forgotPasswordService.sendResetEmail(body.email);
    return { message: 'Reset link sent if email exists.' };
  }
}
