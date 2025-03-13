import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
