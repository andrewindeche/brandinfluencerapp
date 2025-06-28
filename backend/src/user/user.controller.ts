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
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';

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
    const userId = req.user.userId;
    return this.userService.updateBio(userId, updateBioDto.bio);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth-test')
  getTest(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile-image')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    await this.userService.updateProfileImage(userId, file);
    return { imageUrl: `/uploads/${file.filename}` };
  }
}
