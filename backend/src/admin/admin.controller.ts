import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PromoteUserDto } from '../auth/dto/promoteUserToAdmin';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/roles.guard';
import { SessionAuthGuard } from '../session-auth/session-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, SessionAuthGuard, RoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('superuser')
  @Post('promote')
  async promoteUserToAdmin(@Body() promoteUserDto: PromoteUserDto) {
    const { superUserId, userId } = promoteUserDto;
    return this.adminService.promoteUserToAdmin(superUserId, userId);
  }

  @Get('users')
  @Roles('admin')
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }
}
