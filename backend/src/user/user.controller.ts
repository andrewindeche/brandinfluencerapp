import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() userData): Promise<User> {
    return this.userService.createUser(userData);
  }

  @Get('user-type')
  async getUserType(@Query('email') email: string): Promise<{ type: string }> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const userType =
      user.role === 'influencer' ? 'influencer' : 'brand';
      return { type: userType };
    }
    return { type: 'unknown' };
  }
}
