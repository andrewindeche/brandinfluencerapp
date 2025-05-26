import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from './user.schema';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdateProfileImageDto } from './dto/update-profile-image.dto';

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
  async getUserType(
    @Query('email') email: string,
  ): Promise<{ type: string; username?: string }> {
    const user = await this.userService.findUserByEmail(email);
    const validRoles = ['influencer', 'brand', 'admin', 'superuser'] as const;

    if (user && validRoles.includes(user.role)) {
      return {
        type: user.role,
        username: user.username,
      };
    }

    return { type: 'unknown' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bio')
  async updateBio(@Req() req: Request, @Body() updateBioDto: UpdateBioDto) {
    console.log('REQ USER:', req.user);
    const userId = req.user._id;
    return this.userService.updateBio(userId, updateBioDto.bio);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile-image')
  async updateProfileImage(
    @Req() req: Request,
    @Body() updateProfileImageDto: UpdateProfileImageDto,
  ) {
    const userId = req.user._id;
    return this.userService.updateProfileImage(
      userId,
      updateProfileImageDto.profileImage,
    );
  }
}
