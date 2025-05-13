import { Controller, Get, Query,Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = req.user?.sub;
    return this.userService.findById(userId);
  }

  @Get('user-type')
  async getUserType(@Query('email') email: string): Promise<{ type: string }> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const userType = user.role === 'influencer' ? 'influencer' : 'brand';
      return { type: userType };
    }
    return { type: 'unknown' };
  }
}
