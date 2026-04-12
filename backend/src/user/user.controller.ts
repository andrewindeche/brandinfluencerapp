import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Param,
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
    console.log('[UserController] updateBio - userId:', userId, 'bio:', updateBioDto.bio);
    return this.userService.updateBio(userId, updateBioDto.bio);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tips')
  async getTips(@Req() req: Request) {
    const userId = req.user.userId;
    return this.userService.getTips(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tips')
  async updateTips(@Req() req: Request, @Body('tips') tips: string) {
    const userId = req.user.userId;
    return this.userService.updateTips(userId, tips);
  }

  @UseGuards(JwtAuthGuard)
  @Get('influencers')
  async getInfluencers() {
    return this.userService.findInfluencers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('influencers/matched')
  async getMatchedInfluencers(@Req() req: Request) {
    const userId = req.user.userId;
    return this.userService.getMatchedInfluencers(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('brands/matched')
  async getMatchedBrands(@Req() req: Request) {
    const userId = req.user.userId;
    return this.userService.getMatchedBrands(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('brands/accepted')
  async getAcceptedBrands(@Req() req: Request) {
    const userId = req.user.userId;
    return this.userService.getAcceptedBrands(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('interests')
  async updateInterests(@Req() req: Request, @Body('interests') interests: string[]) {
    const userId = req.user.userId;
    return this.userService.updateInterests(userId, interests);
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
    return { imageUrl: `http://localhost:4000/uploads/${file.filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('influencer/:influencerId/accept')
  async acceptInfluencer(@Req() req: any, @Param('influencerId') influencerId: string) {
    const brandId = req.user.userId;
    return this.userService.acceptInfluencer(brandId, influencerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('influencer/:influencerId/reject')
  async rejectInfluencer(@Req() req: any, @Param('influencerId') influencerId: string) {
    const brandId = req.user.userId;
    return this.userService.rejectInfluencer(brandId, influencerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('influencers/pending')
  async getPendingInfluencers(@Req() req: any) {
    const brandId = req.user.userId;
    return this.userService.getMatchedInfluencers(brandId);
  }
}
