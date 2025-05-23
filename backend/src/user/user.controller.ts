import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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
    console.log('Request received at /users/me');
    const userId = req.user?.sub;
    return this.userService.findById(userId);
  }

  @Get('user-type')
  async getUserType(@Query('email') email: string): Promise<{ type: string }> {
    const user = await this.userService.findUserByEmail(email);
    const validRoles = ['influencer', 'brand', 'admin', 'superuser'] as const;

    if (user && validRoles.includes(user.role)) {
      return { type: user.role };
    }

    return { type: 'unknown' };
  }
}
