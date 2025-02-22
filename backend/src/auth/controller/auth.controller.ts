import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '../local-auth.guard';
import { JwtAuthGuard} from '../jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('influencer/login')
  async loginInfluencer(@Body() loginDto: any) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
      'influencer',
    );
    if (user) {
      return this.authService.loginInfluencer(user);
    }
    return { message: 'Invalid credentials' };
  }

  @Post('brand/login')
  async loginBrand(@Body() loginDto: any) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
      'brand',
    );
    if (user) {
      return this.authService.loginBrand(user);
    }
    return { message: 'Invalid credentials' };
  }

  @Post('influencer/register')
  async registerInfluencer(@Body() registerDto: any) {
    const newInfluencer = await this.authService.registerInfluencer(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
    return newInfluencer;
  }

  @Post('brand/register')
  async registerBrand(@Body() registerDto: any) {
    const newBrand = await this.authService.registerBrand(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
    return newBrand;
  }
}
