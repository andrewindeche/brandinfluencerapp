import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Roles } from '../auth/roles.decorator';
import { BrandService } from 'src/user/brand/brand.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/service/auth.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly brandService: BrandService,
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  @Post('create-admin')
  @Roles('admin')
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    return this.adminService.createAdmin(username, email, password);
  }

  @Get('users')
  @Roles('admin')
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('influencers')
  @Roles('admin')
  async getAllInfluencers() {
    return this.authService.findallinfluencers();
  }

  @Get('brands')
  @Roles('admin')
  async getAllBrands() {
    return this.authService.findAllBrands();
  }
}
